import {
  AppData,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
} from "mediasoup-client/types";
import { Socket } from "socket.io-client";

export type CustomMediaKind = MediaKind | "screen" | "none";

export enum SocketStatus {
  Success = "success",
  Error = "error",
}

export interface PeerInfo {
  peerId: string;
  userId: string;
  roomId: string;
  roomName: string;
  displayName: string;
  device: string;
  peerConfig: PeerConfig;
  rtpCapabilities: RtpCapabilities;
  transports: { transportId: string }[];
  producers: ProducerWithStream[];
  consumers: { consumerId: string }[];
}

export type Reaction = "clap" | "love" | "celebrate" | "none";

export interface PeerConfig {
  userId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isPinned: boolean;
  isSharingScreen: boolean;
  hasRaisedHand: boolean;
  reaction: Reaction;
}

export interface RoomInfo {
  roomId: string;
  roomName: string;
}

export interface JoinerInfo {
  userId: string;
  displayName: string;
  device: string;
  rtpCapabilities: RtpCapabilities;
}

export interface JoinRoomRequest {
  roomInfo: RoomInfo;
  peerInfo: JoinerInfo;
}

export interface TransportConnectRequest {
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export interface TransportProduceRequest {
  transportId: string;
  kind: CustomMediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}

export interface ConsumeMediaRequest {
  remoteProducerId: string;
  consumerTransportId: string;
  rtpCapabilities: RtpCapabilities;
}

export interface ResumeConsumerRequest {
  serverConsumerId: string;
}

export interface JoinRoom {
  peerId: string;
  roomId: string;
  roomName: string;
  status: SocketStatus;
}

export interface WebRtcTransport {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface WebRtcTransportConnect {
  status: SocketStatus;
}

export interface WebRtcTransportProduce {
  producerId: string;
}

export interface ConsumeMedia {
  consumerId: string;
  producerId: string;
  kind: CustomMediaKind;
  rtpParameters: RtpParameters;
}

export interface PinPeerConfig {
  userId: string;
  isPinned: boolean;
}

export interface PeerMessage {
  userId: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface PeerMessageResponse {
  peerMessage: PeerMessage;
  status: SocketStatus.Success;
}

export interface ResumeConsumer {
  status: SocketStatus;
}

// export interface GetProducerType {
//   producerId: string;
//   kind: CustomMediaKind;
//   user: UserInfo;
// }

export type PeerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type TransportId = string;
export type ProducerId = string;
export type ConsumerId = string;

export type ProducerWithStream = {
  producerId: string;
  kind: CustomMediaKind;
} & {
  stream?: MediaStream;
  userId: string;
};

// export type Peer = {
//   id: string;
//   userId: string;
//   socket: PeerSocket;
//   transports: Map<TransportId, WebRtcTransport>;
//   producers: Map<ProducerId, ProducerWithStream>;
//   consumers: Map<ConsumerId, Consumer<MyAppData>>;

//   roomId: string;
//   displayName: string;
//   device: string;
//   rtpCapabilities: RtpCapabilities;
// };

export interface GetAllPeers {
  // producers: GetProducerType[];
  peers: PeerInfo[];
}

export interface CloseProducerRequest {
  producerId: string;
}

export interface CloseProducer {
  status: SocketStatus;
}

export interface PeerConfigResponse {
  status: SocketStatus;
}

export interface PinPeerResponse {
  status: SocketStatus;
}

export interface SocketResponse<ResponseDataType = undefined> {
  data?: ResponseDataType;
  error?: string;
}

export interface NewProducer {
  // producer: GetProducerType;
  peer: PeerInfo;
}

export interface CloseProducer {
  producerId: string;
}

export interface ProducerClosed {
  producerId: string;
}

export interface ActiveSpeaker {
  peerId: string | null;
  volume?: number;
}

export interface DominantSpeaker {
  peerId: string | null;
}

export interface SocketEmitEvent<EmitRequest = undefined> {
  request: EmitRequest;
}

// This event list is available when we try to emit an event
// from server for e.g. socket.emit("event-name", callback)
export interface ServerToClientEvents {
  "new-producer": (producerData: SocketEmitEvent<NewProducer>) => void;

  "producer-closed": (producerData: SocketEmitEvent<ProducerClosed>) => void;

  "active-speaker": (volumeData: SocketEmitEvent<ActiveSpeaker>) => void;

  "dominant-speaker": (volumeData: SocketEmitEvent<DominantSpeaker>) => void;

  "peer-config": (peerConfig: SocketEmitEvent<PeerConfig>) => void;

  "peer-message": (peerMessage: SocketEmitEvent<PeerMessage>) => void;

  "peer-left": (peer: SocketEmitEvent<PeerInfo>) => void;
}

// This event list is available when we try to observe an event
// from client for e.g. socket.on("event-name", callback)
export interface ClientToServerEvents {
  "join-room": (
    joinRoomRequest: JoinRoomRequest,
    send: (response: SocketResponse<JoinRoom>) => void
  ) => Promise<void>;

  "get-router-rtp-capabilities": (
    clientRtpCapability: RtpCapabilities | undefined,
    send: (response: SocketResponse<RtpCapabilities>) => void
  ) => Promise<void>;

  "create-web-rtc-transport": (
    send: (response: SocketResponse<WebRtcTransport>) => void
  ) => Promise<void>;

  "transport-connect": (
    transportConnectRequset: TransportConnectRequest,
    send: (response: SocketResponse<WebRtcTransportConnect>) => void
  ) => Promise<void>;

  "transport-produce": (
    transportProduceRequset: TransportProduceRequest,
    send: (response: SocketResponse<WebRtcTransportProduce>) => void
  ) => Promise<void>;

  "consume-media": (
    consumeMediaRequest: ConsumeMediaRequest,
    send: (response: SocketResponse<ConsumeMedia>) => void
  ) => Promise<void>;

  "resume-consumer": (
    resumeConsumerRequest: ResumeConsumerRequest,
    send: (response: SocketResponse<ResumeConsumer>) => void
  ) => Promise<void>;

  "get-all-peers": (
    send: (response: SocketResponse<GetAllPeers>) => void
  ) => Promise<void>;

  "close-producer": (
    closeProduceRequest: CloseProducerRequest,
    send: (response: SocketResponse<CloseProducer>) => void
  ) => void;

  "peer-config": (
    peerConfig: PeerConfig,
    send: (response: SocketResponse<PeerConfigResponse>) => void
  ) => void;

  "pin-peer": (
    pinPeerConfig: PinPeerConfig,
    send: (response: SocketResponse<PinPeerResponse>) => void
  ) => void;

  "peer-message": (
    peerMessage: PeerMessage,
    send: (response: SocketResponse<PeerMessageResponse>) => void
  ) => void;
}
