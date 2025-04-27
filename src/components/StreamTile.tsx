import { Hand, Mic, MicOff, Pin } from "lucide-react";
import { Participant } from "../utils/types";
import { useEffect, useRef } from "react";
import Reaction from "./Reaction";
import { PinPeerConfig } from "../services/socket-types";

const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?";

const StreamTile = ({
  participant,
  onPinToggled,
  className = "",
}: {
  participant: Participant;
  onPinToggled: (pinConfig: PinPeerConfig) => void;
  className?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attach media streams to video/audio elements
  useEffect(() => {
    // Attach video stream if video is on
    if (videoRef.current && participant.isVideoOn && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.onloadedmetadata = () => {
        try {
          videoRef.current?.play();
        } catch (error) {
          // handle permission error
        }
      };
    }
    // Attach audio stream if audio is on
    if (audioRef.current && !participant.isMuted && participant.stream) {
      audioRef.current.srcObject = participant.stream;
      audioRef.current.onloadedmetadata = () => {
        try {
          audioRef.current?.play();
        } catch (error) {
          // handle permission error
        }
      };
    }
  }, [participant.stream, participant.isVideoOn, participant.isMuted]);

  const handlePinToggle = () => {
    const pinConfig = {
      userId: participant.userId,
      isPinned: !participant.isPinned,
    };
    onPinToggled(pinConfig);
  };

  // UI for video and audio both ON
  const renderVideoAndAudio = () => (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className={`object-cover w-full h-full ${
          participant.kind !== "screen" ? "scale-x-[-1]" : ""
        }`}
        autoPlay
        playsInline
      />
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );

  // UI for only audio ON
  const renderAudioOnly = () => (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      <div className="flex items-center justify-center w-20 h-20 mb-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
        <span className="text-2xl text-white">
          {getInitial(participant.name)}
        </span>
      </div>
      <span className="text-sm text-zinc-400">Audio only</span>
    </div>
  );

  // UI for only video ON
  const renderVideoOnly = () => (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className="object-cover w-full h-full scale-x-[-1]"
        autoPlay
        playsInline
      />
    </div>
  );

  // UI for neither video nor audio ON
  const renderNoMedia = () => (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-center justify-center w-20 h-20 mb-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
        <span className="text-2xl text-white">
          {getInitial(participant.name)}
        </span>
      </div>
      <span className="text-sm text-zinc-400">No media</span>
    </div>
  );

  // Decide which UI to render
  let content;
  if (participant.isVideoOn && !participant.isMuted && participant.stream) {
    content = renderVideoAndAudio();
  } else if (
    !participant.isVideoOn &&
    !participant.isMuted &&
    participant.stream
  ) {
    content = renderAudioOnly();
  } else if (
    participant.isVideoOn &&
    participant.isMuted &&
    participant.stream
  ) {
    content = renderVideoOnly();
  } else {
    content = renderNoMedia();
  }

  if (
    !participant.isMuted &&
    participant.isVideoOn &&
    participant.kind === "audio"
  ) {
    className = "hidden";
  }

  return (
    <div
      key={participant.id}
      className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden group flex justify-center items-center ${className}`}
    >
      {participant.reaction && participant.reaction !== "none" && (
        <Reaction reaction={participant.reaction} />
      )}

      {participant.hasRaisedHand && (
        <div className="absolute z-10 right-2 top-2">
          <Hand fill="#fff" />
        </div>
      )}

      {content}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{participant.name}</span>
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <MicOff className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
            <button
              className="transition-opacity opacity-0 group-hover:opacity-100"
              onClick={handlePinToggle}
            >
              <Pin className="w-4 h-4 text-white hover:text-violet-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamTile;
