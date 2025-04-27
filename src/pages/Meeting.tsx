import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import VideoGrid from "../components/VideoGrid";
import ControlBar from "../components/ControlBar";
import Sidebar from "../components/Sidebar";
import DevicesSettingsDialog from "../components/DevicesSettingsDialog";
import {
  LocalProducer,
  MediaSoupClient,
  MediasoupEventsCleaner,
} from "../services/mediasoup";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  PeerConfig,
  PeerInfo,
  PeerMessage,
  PinPeerConfig,
  Reaction,
  ServerToClientEvents,
} from "../services/socket-types";
import { useUser, useClerk } from "@clerk/clerk-react";
import LocalStream from "../components/LocalStream";
import useDeviceStore from "../stores/devices";
import MediaPreviewDialog from "../components/MediaPreviewDialog";
import { getBrowserName } from "../utils/browser";
import RoomHeader from "../components/RoomHeader";
import { Participant } from "../utils/types";

import PeerJoinedSoundPath from "../assets/audio/join.mp3";
import PeerLeftSoundPath from "../assets/audio/leave.mp3";
import PeerMessageSoundPath from "../assets/audio/message.mp3";

const Meeting: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { meetingId } = useParams<{ meetingId: string }>();
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [peerMessages, setPeerMessages] = useState<PeerMessage[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { redirectToSignIn } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  const {
    userInteracted,
    isMuted,
    isVideoOn,
    defaultAudioDevice,
    defaultVideoDevice,
    setUserInteracted,
    setIsMuted,
    setIsVideoOn,
  } = useDeviceStore();
  const [searchParams] = useSearchParams();
  const [screenProducer, setScreenProducer] = useState<LocalProducer | null>(
    null
  );
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  const navigate = useNavigate();

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(
    () =>
      io(import.meta.env.VITE_MEDIASOUP_SERVER_URL.replace("http", "ws"), {
        transports: ["websocket"],
      }),
    []
  );

  const mediasoup = useMemo(
    () =>
      new MediaSoupClient(
        socket,
        (peers) => setPeers(peers),
        (peerMessages) => setPeerMessages(peerMessages),
        {
          actionSounds: {
            playAudio: {
              onPeerJoin: true,
              onPeerLeft: true,
              onPeerMessage: true,
            },
            audioSrc: {
              peerJoinSoundPath: PeerJoinedSoundPath,
              peerLeftSoundPath: PeerLeftSoundPath,
              peerMessageSoundPath: PeerMessageSoundPath,
            },
          },
        }
      ),

    [socket]
  );

  useEffect(() => {
    const onConnect = async () => {
      console.log("Connected", socket.id);
    };

    const onDisconnect = () => {
      console.log("Disconnected", socket.id);
    };

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);

      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      redirectToSignIn({ redirectUrl: window.location.href });
      return;
    }

    if (!userInteracted) {
      setShowPreview(true);
      return;
    }

    let eventsCleaner: MediasoupEventsCleaner;

    const join = async () => {
      if (user && user.id && meetingId) {
        eventsCleaner = await mediasoup.joinRoom(
          { roomId: meetingId, roomName: searchParams.get("title") ?? "" },
          {
            userId: user.id,
            displayName: user.fullName ?? "",
            device: getBrowserName(),
          },
          {
            audio: !isMuted
              ? defaultAudioDevice
                ? { deviceId: defaultAudioDevice.deviceId }
                : true
              : false,
            video: isVideoOn
              ? defaultVideoDevice
                ? { deviceId: defaultVideoDevice.deviceId }
                : true
              : false,
          }
        );
      }
    };

    join();

    return () => {
      eventsCleaner?.();
    };
  }, [userInteracted, isLoaded, isSignedIn, user]);

  const handleAudioDeviceChanged = useCallback(
    async (audioDevice: MediaDeviceInfo) => {
      const peer = peers.find((p) => p.userId === user?.id);
      if (peer) {
        const producerToClose = peer.producers.find((p) => p.kind === "audio");
        if (producerToClose) {
          await mediasoup.closeProducer(producerToClose);
        }
      }

      if (!isMuted) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: audioDevice ? { deviceId: audioDevice.deviceId } : true,
          video: false,
        });

        await mediasoup.createProducer(audioStream);
      }
    },
    [peers, isMuted]
  );

  const handleVideoDeviceChanged = useCallback(
    async (videoDevice: MediaDeviceInfo) => {
      const peer = peers.find((p) => p.userId === user?.id);
      if (peer) {
        const producerToClose = peer.producers.find((p) => p.kind === "video");
        if (producerToClose) {
          await mediasoup.closeProducer(producerToClose);
        }
      }

      if (isVideoOn) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: videoDevice ? { deviceId: videoDevice.deviceId } : true,
          audio: false,
        });

        await mediasoup.createProducer(videoStream);
      }
    },
    [peers, isMuted]
  );

  const participants: Participant[] = [];

  const selfVideoProducer = peers
    .find((_peer) => _peer.userId === user?.id)
    ?.producers.find((_producer) => _producer.kind === "video");

  const selfParticipant: Participant = {
    id: socket.id + "|||" + "OWN-PRODUCER",
    userId: user?.id ?? "",
    name: user?.fullName ?? "You",
    isMuted: isMuted,
    isVideoOn: isVideoOn,
    isPinned: false,
    kind: "video",
    stream: selfVideoProducer?.stream,
    reaction: mediasoup.peer.peerConfig.reaction,
    hasRaisedHand: hasRaisedHand,
  };

  const otherPeers = peers.filter((p) => p.userId !== user?.id);

  for (const peer of otherPeers) {
    if (peer.producers.length === 0) {
      // Peer is present but has no media
      participants.push({
        id: peer.peerId,
        userId: peer.userId,
        name: peer.displayName ?? peer.peerId,
        isMuted: peer.peerConfig.isMuted,
        isVideoOn: peer.peerConfig.isVideoOn,
        isPinned: peer.peerConfig.isPinned,
        kind: "none",
        stream: undefined,
        reaction: peer.peerConfig.reaction,
        hasRaisedHand: peer.peerConfig.hasRaisedHand,
      });
    } else {
      for (const producer of peer.producers) {
        participants.push({
          id: peer.peerId + "|||" + producer.producerId,
          userId: peer.userId,
          name: peer.displayName ?? peer.peerId,
          isMuted: peer.peerConfig.isMuted,
          isVideoOn: peer.peerConfig.isVideoOn,
          isPinned: peer.peerConfig.isPinned,
          kind: producer.kind,
          stream: producer.stream,
          reaction: peer.peerConfig.reaction,
          hasRaisedHand: peer.peerConfig.hasRaisedHand,
        });
      }
    }
  }

  const handleToggleMute = async () => {
    const newIsMuted = !isMuted;

    const peer = peers.find((p) => p.userId === user?.id);

    if (!peer) return;

    await mediasoup.updatePeerConfig({
      ...(mediasoup.peer.peerConfig as PeerConfig),
      userId: user?.id as string,
      isMuted: newIsMuted,
    });

    if (newIsMuted) {
      const producerToClose = peer.producers.find((p) => p.kind === "audio");
      if (producerToClose) {
        await mediasoup.closeProducer(producerToClose);
      }
    } else {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: defaultAudioDevice
          ? { deviceId: defaultAudioDevice.deviceId }
          : true,
        video: false,
      });

      await mediasoup.createProducer(audioStream);
    }

    setIsMuted(newIsMuted);
  };

  const handleToggleVideoOn = async () => {
    const newIsVideoOn = !isVideoOn;
    const peer = peers.find((p) => p.userId === user?.id);

    if (!peer) return;

    await mediasoup.updatePeerConfig({
      ...(mediasoup.peer.peerConfig as PeerConfig),
      userId: user?.id as string,
      isVideoOn: newIsVideoOn,
    });

    if (!newIsVideoOn) {
      const producerToClose = peer.producers.find((p) => p.kind === "video");
      if (producerToClose) {
        await mediasoup.closeProducer(producerToClose);
      }
    } else {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: defaultVideoDevice
          ? { deviceId: defaultVideoDevice.deviceId }
          : true,
        audio: false,
      });

      await mediasoup.createProducer(videoStream);
    }

    setIsVideoOn(newIsVideoOn);
  };

  const handleReaction = async (reaction: Reaction) => {
    await mediasoup.updatePeerConfig({
      ...mediasoup.peer.peerConfig,
      userId: user?.id as string,
      reaction,
    });

    setTimeout(async () => {
      await mediasoup.updatePeerConfig({
        ...mediasoup.peer.peerConfig,
        userId: user?.id as string,
        reaction: "none",
      });
    }, 3000);
  };

  const handleToggleRaisedHand = async () => {
    const newHasRaisedHand = !hasRaisedHand;

    await mediasoup.updatePeerConfig({
      ...mediasoup.peer.peerConfig,
      userId: user?.id as string,
      hasRaisedHand: newHasRaisedHand,
    });

    setHasRaisedHand(newHasRaisedHand);
  };

  const handlePinUser = (pinConfig: PinPeerConfig) => {
    mediasoup.updatePinPeer(pinConfig);
  };

  const handleShareScreen = async () => {
    const newIsScreenSharing = !Boolean(screenProducer);

    await mediasoup.updatePeerConfig({
      ...mediasoup.peer.peerConfig,
      userId: user?.id as string,
      isSharingScreen: newIsScreenSharing,
    });

    if (newIsScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenProducer = await mediasoup.createProducer(
        screenStream,
        "screen"
      );

      const streamVideoTrack = screenStream.getVideoTracks()[0];

      streamVideoTrack.onended = () => {
        mediasoup.closeProducer({
          producerId: screenProducer.id,
          userId: screenProducer.userId,
          kind: screenProducer.kind,
          stream: screenProducer.stream,
        });
        setScreenProducer(null);
      };

      setScreenProducer(screenProducer);
    } else {
      if (screenProducer) {
        await mediasoup.closeProducer({
          producerId: screenProducer.id,
          userId: screenProducer.userId,
          kind: screenProducer.kind,
          stream: screenProducer.stream,
        });
        setScreenProducer(null);
      }
    }
  };

  const handleSendPeerMessage = (message: string) => {
    const peerMessage: PeerMessage = {
      userId: user?.id as string,
      name: user?.firstName as string,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    mediasoup.sendPeerMessage(peerMessage);
  };

  const handleEndCall = async () => {
    mediasoup.leaveRoom();
    socket.disconnect();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#2D3B55]">
      <div className="relative h-screen">
        <RoomHeader
          roomName={
            mediasoup.peer.roomName
              ? mediasoup.peer.roomName
              : (meetingId as string)
          }
          isSharingScreen={Boolean(screenProducer)}
        />

        <VideoGrid participants={participants} onPinToggled={handlePinUser} />

        <LocalStream
          participant={selfParticipant}
          onPinToggled={handlePinUser}
        />

        <ControlBar
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          hasRaisedHand={hasRaisedHand}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideoOn}
          onToggleScreenShare={handleShareScreen}
          onEndCall={handleEndCall}
          onToggleChat={() => {
            setIsChatOpen(!isChatOpen);
            setIsParticipantsOpen(false);
          }}
          onToggleParticipants={() => {
            setIsParticipantsOpen(!isParticipantsOpen);
            setIsChatOpen(false);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onReaction={handleReaction}
          onToggleRaisedHand={handleToggleRaisedHand}
        />

        <Sidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          type="chat"
          peerMessages={peerMessages}
          onPeerMessage={handleSendPeerMessage}
        />

        <Sidebar
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          type="participants"
          participants={[selfParticipant, ...participants]}
        />

        <DevicesSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onAudioDeviceChanged={handleAudioDeviceChanged}
          onVideoDeviceChanged={handleVideoDeviceChanged}
        />

        <MediaPreviewDialog
          isOpen={showPreview}
          isSettingsOpen={false}
          onClose={() => {
            setUserInteracted(true);
            setShowPreview(false);
          }}
          onJoin={() => {
            setUserInteracted(true);
            setShowPreview(false);
          }}
        />
      </div>
    </div>
  );
};

export default Meeting;
