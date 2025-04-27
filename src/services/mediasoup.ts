import * as mediasoupClient from "mediasoup-client";
import {
  AppData,
  Consumer,
  MediaKind,
  Producer,
  RtpCapabilities,
  Transport,
  TransportOptions,
} from "mediasoup-client/types";
import type { Socket } from "socket.io-client";
import type {
  ActiveSpeaker,
  ClientToServerEvents,
  ConsumerId,
  CustomMediaKind,
  DominantSpeaker,
  GetAllPeers,
  JoinRoom,
  NewProducer,
  PeerConfig,
  PeerInfo,
  PeerMessage,
  PinPeerConfig,
  ProducerClosed,
  ProducerId,
  ProducerWithStream,
  RoomInfo,
  ServerToClientEvents,
  SocketEmitEvent,
  SocketResponse,
} from "./socket-types";
import { AwaitQueue } from "awaitqueue";
import { MediasoupExtraConfig } from "./ms-types";

export interface LocalConsumer extends Consumer<AppData> {
  userId: string;
}

export interface LocalProducer extends Producer<AppData> {
  userId: string;
  stream?: MediaStream;
}

export class MediaSoupClient {
  user: PeerInfo;
  device: mediasoupClient.Device;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  // Only one send and one receive transport per client
  sendTransport?: Transport<AppData>;
  recvTransport?: Transport<AppData>;

  producers: Map<ProducerId, LocalProducer> = new Map();
  consumers: Map<ConsumerId, LocalConsumer> = new Map();
  // msProducers: Map<ProducerId, Producer<AppData>> = new Map();

  peers: PeerInfo[] = [];
  peerMessages: PeerMessage[] = [];

  onPeersUpdated: (peers: PeerInfo[]) => void;
  onPeerMessagesUpdated: (peerMessages: PeerMessage[]) => void;

  private peerQueues: Map<string, AwaitQueue> = new Map();

  private config?: MediasoupExtraConfig;

  get peer(): PeerInfo {
    const user: PeerInfo = {
      ...this.user,
      transports: [],
      producers: [],
      consumers: [],
    };

    if (this.sendTransport) {
      user.transports.push({ transportId: this.sendTransport.id });
    }
    if (this.recvTransport) {
      user.transports.push({ transportId: this.recvTransport.id });
    }

    for (const [_producerId, producer] of this.producers) {
      user.producers.push({
        userId: producer.userId,
        producerId: producer.id,
        kind: producer.kind,
        stream: producer.stream,
      });
    }

    for (const [consumerId, _consumer] of this.consumers) {
      user.consumers.push({ consumerId });
    }

    return user;
  }

  constructor(
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    onPeersUpdated: (peers: PeerInfo[]) => void,
    onPeerMessagesUpdated: (peerMessages: PeerMessage[]) => void,
    config?: MediasoupExtraConfig
  ) {
    this.socket = socket;
    this.onPeersUpdated = onPeersUpdated;
    this.onPeerMessagesUpdated = onPeerMessagesUpdated;

    this.config = config;

    this.device = new mediasoupClient.Device();

    this.user = {
      userId: "",
      peerId: "",
      roomId: "",
      roomName: "",
      rtpCapabilities: {},
      device: "",
      displayName: "",
      transports: [],
      producers: [],
      consumers: [],
      peerConfig: {
        userId: "",
        isMuted: false,
        isVideoOn: true,
        isPinned: false,
        hasRaisedHand: false,
        isSharingScreen: false,
        reaction: "none",
      },
    };
  }

  loadDeviceRtpCapabilities = async () => {
    if (this.device.loaded) return this.device;
    const routerRtpCapabilities = await this.getRouterRtpCapabilities();
    await this.device.load({ routerRtpCapabilities });
    return this.device;
  };

  getRouterRtpCapabilities = async (): Promise<RtpCapabilities> => {
    return new Promise((resolve, reject) => {
      this.socket.emit("get-router-rtp-capabilities", undefined, (response) => {
        if (!response.data) {
          reject(response.error);
          return;
        }
        resolve(response.data);
      });
    });
  };

  // Only create one send transport per client
  createSendTransport = async (): Promise<Transport<AppData>> => {
    if (this.sendTransport) return this.sendTransport;
    const webRtcTransportParams = await this.createWebRtcTransport();
    let transport = this.device.createSendTransport<AppData>(
      webRtcTransportParams
    );
    transport = await this.registerTransportConnectEvent(
      webRtcTransportParams.id,
      transport
    );
    transport = await this.registerTransportProduceEvent(
      webRtcTransportParams.id,
      transport
    );
    this.sendTransport = transport;
    return transport;
  };

  // Only create one receive transport per client
  createRecvTransport = async (): Promise<Transport<AppData>> => {
    if (this.recvTransport) return this.recvTransport;
    const webRtcTransportParams = await this.createWebRtcTransport();
    let transport = this.device.createRecvTransport<AppData>(
      webRtcTransportParams
    );
    transport = await this.registerTransportConnectEvent(
      webRtcTransportParams.id,
      transport
    );
    this.recvTransport = transport;
    return transport;
  };

  createWebRtcTransport = async (): Promise<TransportOptions<AppData>> => {
    return new Promise((resolve, reject) => {
      this.socket.emit("create-web-rtc-transport", (response) => {
        if (!response.data) {
          reject(response.error);
          return;
        }
        resolve(response.data);
      });
    });
  };

  registerTransportConnectEvent = async (
    transportId: string,
    localDeviceTransport: Transport<AppData>
  ): Promise<Transport<AppData>> => {
    localDeviceTransport.on(
      "connect",
      ({ dtlsParameters }, callback, errorCallback) => {
        this.socket.emit(
          "transport-connect",
          { transportId, dtlsParameters },
          (response) => {
            if (!response.data) {
              console.error(response.error);
              errorCallback(new Error(response.error));
              return;
            }
            callback();
          }
        );
      }
    );
    return localDeviceTransport;
  };

  registerTransportProduceEvent = async (
    transportId: string,
    localDeviceTransport: Transport<AppData>
  ): Promise<Transport<AppData>> => {
    localDeviceTransport.on("produce", (produceParams, callback, errorBack) => {
      this.socket.emit(
        "transport-produce",
        {
          transportId,
          kind: produceParams.kind,
          rtpParameters: produceParams.rtpParameters,
          appData: produceParams.appData,
        },
        (response) => {
          if (!response.data) {
            console.error(response.error);
            errorBack(new Error(response.error));
            return;
          }
          callback({ id: response.data.producerId });
        }
      );
    });
    return localDeviceTransport;
  };

  // For Consumption from Producers
  consumeMedia = async (
    producer: ProducerWithStream,
    userId: string
  ): Promise<ProducerWithStream> => {
    const receiverTransport = await this.createRecvTransport();
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "consume-media",
        {
          remoteProducerId: producer.producerId,
          consumerTransportId: receiverTransport.id,
          rtpCapabilities: this.device.rtpCapabilities,
        },
        async (response) => {
          if (!response.data) {
            console.error(response.error);
            reject(response.error);
            return;
          }
          const consumer = (await receiverTransport.consume<AppData>({
            id: response.data.consumerId,
            producerId: response.data.producerId,
            kind: response.data.kind as unknown as MediaKind,
            rtpParameters: response.data.rtpParameters,
          })) as unknown as LocalConsumer;

          consumer.on("transportclose", () => {
            this.consumers.delete(consumer.id);
          });

          consumer.userId = userId;

          this.consumers.set(consumer.id, consumer);

          producer.userId = userId;
          const producerStream = new MediaStream();
          producerStream.addTrack(consumer.track);
          producer.stream = producerStream;

          this.resumeStream(response.data.consumerId);

          resolve(producer);
        }
      );
    });
  };

  resumeStream = (serverConsumerId: string) => {
    this.socket.emit("resume-consumer", { serverConsumerId }, (response) => {
      if (!response.data) {
        console.error(response.error);
        return;
      }
    });
  };

  // For Producing from Media
  produceMedia = async (stream: MediaStream, kind?: "screen") => {
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    const sendTransport = await this.createSendTransport();

    if (kind === "screen") {
      for (const [id, producer] of this.producers) {
        if (producer.appData.kind === "screen") {
          producer.close();
          this.producers.delete(id);
        }
      }

      const screenProducer = (await sendTransport.produce<AppData>({
        track: videoTrack,
        appData: { kind: "screen" },
      })) as unknown as LocalProducer;

      screenProducer.userId = this.user.userId;
      screenProducer.stream = new MediaStream([videoTrack]);

      this.producers.set(screenProducer.id, screenProducer);

      return screenProducer;
    }

    if (videoTrack) {
      // Find and close previous video producer
      for (const [id, producer] of this.producers) {
        if (producer.appData.kind === "video") {
          producer.close();
          this.producers.delete(id);
        }
      }

      const videoProducer = (await sendTransport.produce<AppData>({
        track: videoTrack,
        appData: { kind: "video" },
      })) as LocalProducer;

      videoProducer.userId = this.user.userId;
      videoProducer.stream = new MediaStream([videoTrack]);

      this.producers.set(videoProducer.id, videoProducer);

      return videoProducer;
    }

    // if (audioTrack) {
    // Find and close previous audio producer
    for (const [id, producer] of this.producers) {
      if (producer.appData.kind === "audio") {
        producer.close();
        this.producers.delete(id);
      }
    }

    const audioProducer = (await sendTransport.produce<AppData>({
      track: audioTrack,
      appData: { kind: "audio" },
    })) as LocalProducer;

    audioProducer.userId = this.user.userId;
    audioProducer.stream = new MediaStream([audioTrack]);

    this.producers.set(audioProducer.id, audioProducer);

    return audioProducer;
    // }
  };

  getUserMedia = async (mediaStreamConstrains?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstrains
      );
      return stream;
    } catch (error) {
      console.error(error);
    }
  };

  joinRoom = (
    roomInfo: RoomInfo,
    peer: {
      userId: string;
      displayName?: string;
      device?: string;
    },
    mediaStreamConstrains?: MediaStreamConstraints
  ): Promise<MediasoupEventsCleaner> => {
    return new Promise((resolve, reject) => {
      this.user.userId = peer.userId;
      this.user.displayName = peer.displayName ?? "";
      this.user.device = peer.device ?? "";

      this.socket.emit(
        "join-room",
        {
          roomInfo,
          peerInfo: {
            userId: this.user.userId,
            displayName: this.user.displayName,
            device: this.user.device,
            rtpCapabilities: this.device.loaded
              ? this.device.rtpCapabilities
              : {},
          },
        },
        async (response) => {
          const joined = await this.handleJoinRoom(
            response,
            mediaStreamConstrains
          );
          if (!joined) {
            reject("Join Room Failed.");
          }
        }
      );

      resolve(this.unregisterOnLoadEvents);
    });
  };

  handleJoinRoom = async (
    response: SocketResponse<JoinRoom>,
    mediaStreamConstrains?: MediaStreamConstraints
  ) => {
    if (!response.data) {
      console.error(response.error);
      return false;
    }
    this.user.peerId = response.data.peerId;
    this.user.roomName = response.data.roomName;
    await this.loadDeviceRtpCapabilities();
    const streamMedia = await this.getUserMedia(mediaStreamConstrains);
    if (streamMedia) {
      await this.createProducer(streamMedia);
    }
    this.socket.emit("get-all-peers", this.handleGetAllPeers);
    this.socket.on("new-producer", this.handleNewProducer);
    this.socket.on("producer-closed", this.handleProducerClosed);
    this.socket.on("peer-config", this.handlePeerConfig);
    this.socket.on("peer-message", this.handlePeerMessage);
    this.socket.on("peer-left", this.handlePeerLeft);
    // this.socket.on("active-speaker", this.handleActiveSpeaker);
    // this.socket.on("dominant-speaker", this.handleDominantSpeaker);

    return true;
  };

  handleGetAllPeers = async (response: SocketResponse<GetAllPeers>) => {
    if (!response.data) {
      console.error(response.error);
      return;
    }

    const resolvedPeers = await Promise.all(
      response.data.peers
        .filter((_peer) => _peer.userId !== this.user.userId)
        .map(async (_peer) => {
          const proms: Promise<ProducerWithStream>[] = [];
          _peer.producers.forEach((_producer) =>
            proms.push(this.consumeMedia(_producer, _peer.userId))
          );
          await Promise.all(proms);
          return _peer;
        })
    );

    this.peers = [this.peer, ...resolvedPeers];

    this.onPeersUpdated(this.peers);
  };

  handleNewProducer = async ({ request }: SocketEmitEvent<NewProducer>) => {
    const { peer: newPeer } = request;
    const userId = newPeer.userId;

    // Get or create the AwaitQueue for this peer
    let queue = this.peerQueues.get(userId);
    if (!queue) {
      queue = new AwaitQueue();
      this.peerQueues.set(userId, queue);
    }

    queue
      .push(async () => {
        const proms: Promise<ProducerWithStream>[] = [];

        newPeer.producers.forEach((_producer) => {
          proms.push(this.consumeMedia(_producer, newPeer.userId));
        });

        const prodcuers = await Promise.allSettled(proms);

        newPeer.producers = prodcuers
          .filter((p) => p.status === "fulfilled")
          .map((p) => p.value);

        const peer = this.peers.find((_peer) => _peer.userId == newPeer.userId);
        if (peer) {
          this.peers = this.peers.map((_peer) =>
            _peer.userId === newPeer.userId ? newPeer : _peer
          );
        } else {
          this.peers.push(newPeer);
          this.playPeerJoinedSound();
        }

        this.onPeersUpdated([...this.peers]);

        if (queue.size === 0) {
          this.peerQueues.delete(userId);
        }
      })
      .catch((err) => {
        console.error("Error in handleNewProducer AwaitQueue:", err);
      });
  };

  handleProducerClosed = async ({
    request,
  }: SocketEmitEvent<ProducerClosed>) => {
    const { producerId } = request;

    this.peers = this.peers.map((_peer) =>
      _peer.producers.some((producer) => producer.producerId === producerId)
        ? {
            ..._peer,
            producers: _peer.producers.filter(
              (_p) => _p.producerId !== producerId
            ),
          }
        : _peer
    );

    this.onPeersUpdated(this.peers);
  };

  handlePeerConfig = async ({
    request: peerConfig,
  }: SocketEmitEvent<PeerConfig>) => {
    const { userId } = peerConfig;
    this.peers = this.peers.map((p) => {
      if (p.userId === userId) {
        p.peerConfig = { ...peerConfig };
        return p;
      } else {
        return p;
      }
    });

    this.onPeersUpdated(this.peers);
  };

  handlePeerMessage = async ({
    request: peerMessage,
  }: SocketEmitEvent<PeerMessage>) => {
    this.peerMessages = [...this.peerMessages, peerMessage];
    this.playPeerMessageSound();
    this.onPeerMessagesUpdated(this.peerMessages);
  };

  handlePeerLeft = async ({ request: peerInfo }: SocketEmitEvent<PeerInfo>) => {
    const { userId } = peerInfo;
    this.peers = this.peers.filter((p) => p.userId !== userId);
    this.playPeerLeftSound();
    this.onPeersUpdated(this.peers);
  };

  handleActiveSpeaker = async ({ request }: SocketEmitEvent<ActiveSpeaker>) => {
    const { peerId, volume: _volume } = request;
    const activeVolumePeerIndex = this.peers.findIndex(
      (peer) => peer.peerId === peerId
    );
    if (activeVolumePeerIndex === -1) return;
    const activeVolumePeer = this.peers[activeVolumePeerIndex];
    this.peers.splice(activeVolumePeerIndex, 1);
    this.peers.unshift(activeVolumePeer);
  };

  handleDominantSpeaker = async ({
    request,
  }: SocketEmitEvent<DominantSpeaker>) => {
    const { peerId } = request;
    const activeVolumePeerIndex = this.peers.findIndex(
      (peer) => peer.peerId === peerId
    );
    if (activeVolumePeerIndex === -1) return;
    const activeVolumePeer = this.peers[activeVolumePeerIndex];
    this.peers.splice(activeVolumePeerIndex, 1);
    this.peers.unshift(activeVolumePeer);
  };

  unregisterOnLoadEvents: MediasoupEventsCleaner = () => {
    this.socket.off("new-producer", this.handleNewProducer);
    this.socket.off("producer-closed", this.handleProducerClosed);
    this.socket.off("active-speaker", this.handleActiveSpeaker);
    this.socket.off("dominant-speaker", this.handleDominantSpeaker);
    this.socket.off("peer-config", this.handlePeerConfig);
  };

  createProducer = async (stream: MediaStream, kind?: "screen") => {
    const producer = await this.produceMedia(stream, kind);

    this.peers = [
      this.peer,
      ...this.peers.filter((_peer) => _peer.userId !== this.peer.userId),
    ];

    this.onPeersUpdated(this.peers);

    return producer;
  };

  closeProducer = (producer: ProducerWithStream) => {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "close-producer",
        { producerId: producer.producerId },
        (response) => {
          if (!response.data) {
            console.error(response.error);
            reject(response.error);
            return;
          }
          this.producers.delete(producer.producerId);
          this.onPeersUpdated([
            this.peer,
            ...this.peers.filter((peer) => peer.userId !== this.user.userId),
          ]);
          resolve(response.data);
        }
      );
    });
  };

  updatePeerConfig = (config: PeerConfig) => {
    return new Promise((resolve, reject) => {
      this.socket.emit("peer-config", config, (response) => {
        if (!response.data) {
          console.error(response.error);
          reject(response.error);
          return;
        }

        const peer = this.peers.find((_peer) => _peer.userId == config.userId);

        if (peer) {
          this.user.peerConfig = { ...config };

          if (peer.userId !== this.user.userId) {
            this.sortPinnedPeers();
          }
        }

        this.onPeersUpdated([
          this.peer,
          ...this.peers.filter((peer) => peer.userId !== this.user.userId),
        ]);

        resolve(response.data);
      });
    });
  };

  updatePinPeer = (pinConfig: PinPeerConfig) => {
    return new Promise((resolve, reject) => {
      this.socket.emit("pin-peer", pinConfig, (response) => {
        if (!response.data) {
          console.error(response.error);
          reject(response.error);
          return;
        }

        const peer = this.peers.find(
          (_peer) => _peer.userId == pinConfig.userId
        );

        if (peer) {
          peer.peerConfig.isPinned = pinConfig.isPinned;
        }

        this.sortPinnedPeers();

        this.onPeersUpdated([...this.peers]);

        resolve(response.data);
      });
    });
  };

  sortPinnedPeers = () => {
    this.peers = this.peers.sort((a, b) => {
      // If b is pinned and a is not, b should come first (return 1)
      if (b.peerConfig.isPinned && !a.peerConfig.isPinned) {
        return 1;
      }
      // If a is pinned and b is not, a should come first (return -1)
      else if (a.peerConfig.isPinned && !b.peerConfig.isPinned) {
        return -1;
      }
      // If both are pinned or both are not pinned, maintain original order (return 0)
      else {
        return 0;
      }
    });
  };

  sendPeerMessage = (peerMessage: PeerMessage) => {
    return new Promise((resolve, reject) => {
      this.socket.emit("peer-message", peerMessage, (response) => {
        if (!response.data) {
          console.error(response.error);
          reject(response.error);
          return;
        }

        this.peerMessages = [...this.peerMessages, peerMessage];

        this.onPeerMessagesUpdated(this.peerMessages);

        resolve(response.data);
      });
    });
  };

  leaveRoom = async () => {
    const proms: Promise<unknown>[] = [];

    this.producers.forEach((_producer) => {
      proms.push(
        this.closeProducer({
          producerId: _producer.id,
          kind: _producer.appData.kind as CustomMediaKind,
          userId: _producer.userId,
          stream: _producer.stream,
        })
      );
    });

    await Promise.all(proms);

    this.producers.clear();
    this.consumers.clear();

    this.peers = [];
    this.peerMessages = [];

    this.unregisterOnLoadEvents();
  };

  playPeerJoinedSound = async () => {
    const playPeerJoinedSound =
      this.config?.actionSounds?.playAudio?.onPeerJoin;

    if (!playPeerJoinedSound) return;

    const joinSoundPath =
      this.config?.actionSounds?.audioSrc?.peerJoinSoundPath;

    if (joinSoundPath) {
      await this.playSound(joinSoundPath);
    }
  };

  playPeerLeftSound = async () => {
    const playPeerleftSound = this.config?.actionSounds?.playAudio?.onPeerLeft;

    if (!playPeerleftSound) return;

    const leftSoundPath =
      this.config?.actionSounds?.audioSrc?.peerLeftSoundPath;

    if (leftSoundPath) {
      await this.playSound(leftSoundPath);
    }
  };

  playPeerMessageSound = async () => {
    const playPeerMessageSound =
      this.config?.actionSounds?.playAudio?.onPeerMessage;

    if (!playPeerMessageSound) return;

    const messageSoundPath =
      this.config?.actionSounds?.audioSrc?.peerMessageSoundPath;

    if (messageSoundPath) {
      await this.playSound(messageSoundPath);
    }
  };

  playSound = async (path: string) => {
    const audio = new Audio(path);
    await audio.play();
  };
}

export type MediasoupEventsCleaner = () => void;
