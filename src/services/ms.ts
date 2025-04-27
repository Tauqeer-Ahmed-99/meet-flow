// import * as mediasoupClient from "mediasoup-client";
// import type {
//   AppData,
//   Consumer,
//   Producer,
//   RtpCapabilities,
//   Transport,
//   TransportOptions,
// } from "mediasoup-client/types";

// import type { Socket } from "socket.io-client";

// import type {
//   ActiveSpeaker,
//   ClientToServerEvents,
//   ConsumerId,
//   DominantSpeaker,
//   GetAllPeers,
//   JoinRoom,
//   NewProducer,
//   PeerConfig,
//   PeerInfo,
//   ProducerClosed,
//   ProducerId,
//   ProducerWithStream,
//   RoomInfo,
//   ServerToClientEvents,
//   SocketEmitEvent,
//   SocketResponse,
//   TransportId,
// } from "./socket-types";

// export class MediaSoupClient {
//   user: PeerInfo;

//   device: mediasoupClient.Device;

//   socket: Socket<ServerToClientEvents, ClientToServerEvents>;

//   transports: Map<TransportId, Transport<AppData>> = new Map();
//   producers: Map<ProducerId, ProducerWithStream> = new Map();
//   consumers: Map<ConsumerId, Consumer<AppData>> = new Map();

//   msProducers: Map<ProducerId, Producer<AppData>> = new Map();

//   peers: PeerInfo[] = [];

//   onProducersUpdated?: (producers: PeerInfo[]) => void;

//   onLocalUserUpdated?: (user: PeerInfo) => void;

//   get userInfo(): PeerInfo {
//     const user: PeerInfo = {
//       ...this.user,
//       transports: [],
//       producers: [],
//       consumers: [],
//     };

//     for (const [transportId, _transport] of this.transports) {
//       user.transports.push({ transportId });
//     }

//     for (const [_producerId, producer] of this.producers) {
//       user.producers.push(producer);
//     }

//     for (const [consumerId, _consumer] of this.consumers) {
//       user.consumers.push({ consumerId });
//     }

//     return user;
//   }

//   constructor(
//     socket: Socket<ServerToClientEvents, ClientToServerEvents>,
//     // onSubscriptionsUpdated?: (subscriptionData: SubscriptionData[]) => void,
//     onProducersUpdated?: (producers: PeerInfo[]) => void,
//     onLocalUserUpdated?: (user: PeerInfo) => void
//   ) {
//     this.socket = socket;
//     // this.onSubscriptionsUpdated = onSubscriptionsUpdated;
//     this.onProducersUpdated = onProducersUpdated;
//     this.onLocalUserUpdated = onLocalUserUpdated;

//     this.device = new mediasoupClient.Device();

//     this.user = {
//       userId: "",
//       peerId: "",
//       roomId: "",
//       roomName: "",
//       rtpCapabilities: {},
//       device: "",
//       displayName: "",
//       transports: [],
//       producers: [],
//       consumers: [],
//       peerConfig: {
//         userId: "",
//         isMuted: false,
//         isVideoOn: true,
//         isPinned: false,
//         hasRaisedHand: false,
//         isSharingScreen: false,
//       },
//     };
//   }

//   loadDeviceRtpCapabilities = async () => {
//     if (this.device.loaded) return this.device;

//     const routerRtpCapabilities = await this.getRouterRtpCapabilities();

//     await this.device.load({ routerRtpCapabilities });

//     return this.device;
//   };

//   getRouterRtpCapabilities = async (): Promise<RtpCapabilities> => {
//     const routerRtpCapabilities: RtpCapabilities = await new Promise(
//       (resolve, reject) => {
//         this.socket.emit(
//           "get-router-rtp-capabilities",
//           undefined,
//           (response) => {
//             if (!response.data) {
//               reject(response.error);
//               return;
//             }
//             resolve(response.data);
//           }
//         );
//       }
//     );

//     return routerRtpCapabilities;
//   };

//   createSendTransport = async (): Promise<Transport<AppData>> => {
//     const webRtcTransportParams = await this.createWebRtcTransport();

//     let transport = this.device.createSendTransport<AppData>(
//       webRtcTransportParams
//     );

//     transport = await this.registerTransportConnectEvent(
//       webRtcTransportParams.id,
//       transport
//     );

//     transport = await this.registerTransportProduceEvent(
//       webRtcTransportParams.id,
//       transport
//     );

//     this.transports.set(transport.id, transport);

//     return transport;
//   };

//   createRecvTransport = async (): Promise<Transport<AppData>> => {
//     const webRtcTransportParams = await this.createWebRtcTransport();

//     let transport = this.device.createRecvTransport<AppData>(
//       webRtcTransportParams
//     );

//     transport = await this.registerTransportConnectEvent(
//       webRtcTransportParams.id,
//       transport
//     );

//     this.transports.set(transport.id, transport);

//     return transport;
//   };

//   createWebRtcTransport = async (): Promise<TransportOptions<AppData>> => {
//     const webRtcTransportParams: TransportOptions<AppData> = await new Promise(
//       (resolve, reject) => {
//         this.socket.emit("create-web-rtc-transport", (response) => {
//           if (!response.data) {
//             reject(response.error);
//             return;
//           }

//           resolve(response.data);
//         });
//       }
//     );

//     return webRtcTransportParams;
//   };

//   registerTransportConnectEvent = async (
//     transportId: string,
//     localDeviceTransport: Transport<AppData>
//   ): Promise<Transport<AppData>> => {
//     localDeviceTransport.on(
//       "connect",
//       ({ dtlsParameters }, callback, errorCallback) => {
//         this.socket.emit(
//           "transport-connect",
//           { transportId, dtlsParameters },
//           (response) => {
//             if (!response.data) {
//               console.error(response.error);
//               errorCallback(new Error(response.error));
//               return;
//             }
//             callback();
//           }
//         );
//       }
//     );

//     return localDeviceTransport;
//   };

//   registerTransportProduceEvent = async (
//     transportId: string,
//     localDeviceTransport: Transport<AppData>
//   ): Promise<Transport<AppData>> => {
//     localDeviceTransport.on("produce", (produceParams, callback, errorBack) => {
//       this.socket.emit(
//         "transport-produce",
//         {
//           transportId,
//           kind: produceParams.kind,
//           rtpParameters: produceParams.rtpParameters,
//         },
//         (response) => {
//           if (!response.data) {
//             console.error(response.error);
//             errorBack(new Error(response.error));
//             return;
//           }
//           callback({ id: response.data.producerId });
//         }
//       );
//     });

//     return localDeviceTransport;
//   };

//   // For Consumption from Producers

//   consumeMedia = async (producer: ProducerWithStream) => {
//     const receiverTransport = await this.createRecvTransport(); //where to consume => consumer transport

//     this.socket.emit(
//       "consume-media",
//       {
//         remoteProducerId: producer.producerId,
//         consumerTransportId: receiverTransport.id,
//         rtpCapabilities: this.device.rtpCapabilities,
//       },
//       async (response) => {
//         if (!response.data) {
//           console.error(response.error);
//           return;
//         }

//         //consumer/subscriber to consume a remote Producer.
//         const consumer = await receiverTransport.consume<AppData>({
//           id: response.data.consumerId,
//           producerId: response.data.producerId,
//           kind: response.data.kind,
//           rtpParameters: response.data.rtpParameters,
//         });

//         this.consumers.set(consumer.id, consumer);

//         //remote producer media
//         const producerStream = new MediaStream();
//         producerStream.addTrack(consumer.track);

//         producer.stream = producerStream; // keep a reference to the stream

//         this.onProducersUpdated?.([...this.peers]);

//         this.resumeStream(response.data.consumerId); // resume the stream once added
//       }
//     );

//     return receiverTransport;
//   };

//   resumeStream = (serverConsumerId: string) => {
//     this.socket.emit("resume-consumer", { serverConsumerId }, (response) => {
//       if (!response.data) {
//         console.error(response.error);
//         return;
//       }
//       console.log("resume-consumer", response.data);
//     });
//   };

//   // For Producing from Media

//   produceMedia = async (stream: MediaStream) => {
//     const videoTrack = stream.getVideoTracks()[0];
//     const audioTrack = stream.getAudioTracks()[0];

//     const sendTransport = await this.createSendTransport();
//     if (videoTrack) {
//       const videoProducer = await sendTransport.produce<AppData>({
//         track: videoTrack,
//       });

//       console.log(`Produced video with ID: ${videoProducer.id}`);

//       const producerInfo: ProducerWithStream = {
//         kind: "video",
//         producerId: videoProducer.id,
//         stream: new MediaStream([videoTrack]),
//       };

//       this.producers.set(videoProducer.id, producerInfo);
//       this.msProducers.set(videoProducer.id, videoProducer);
//     }

//     if (audioTrack) {
//       const audioProducer = await sendTransport.produce<AppData>({
//         track: audioTrack,
//       });

//       console.log(`Produced audio with ID: ${audioProducer.id}`);

//       const producerInfo: ProducerWithStream = {
//         kind: "audio",
//         producerId: audioProducer.id,
//         stream: new MediaStream([audioTrack]),
//       };

//       this.producers.set(audioProducer.id, producerInfo);
//       this.msProducers.set(audioProducer.id, audioProducer);
//     }

//     this.onLocalUserUpdated?.(this.userInfo);
//     this.peers = this.peers.map((_peer) =>
//       _peer.userId === this.userInfo.userId ? this.userInfo : _peer
//     );
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   getUserMedia = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       // this.onLocalStreamLoaded?.(stream);

//       return stream;
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // onLoadHandlersRegisterar

//   joinRoom = (
//     roomInfo: RoomInfo,
//     userInfo: {
//       userId: string;
//       displayName?: string;
//       device?: string;
//     }
//   ) => {
//     // this.user = {
//     //   // this peerId is the local socket id
//     //   peerId: this.socket.id ?? "",
//     //   roomId,
//     //   userId,
//     //   displayName: "Tauqeer",
//     //   device: "Chrome",
//     //   rtpCapabilities: this.device.loaded ? this.device.rtpCapabilities : {},
//     //   producers: [],
//     //   transports: [],
//     //   consumers: [],
//     // };

//     this.user.userId = userInfo.userId;
//     this.user.displayName = userInfo.displayName ?? "";
//     this.user.device = userInfo.device ?? "";

//     this.socket.emit(
//       "join-room",
//       {
//         roomInfo,
//         peerInfo: {
//           userId: this.user.userId,
//           displayName: this.user.displayName,
//           device: this.user.device,
//           rtpCapabilities: this.device.loaded
//             ? this.device.rtpCapabilities
//             : {},
//         },
//       },
//       this.handleJoinRoom
//     );

//     return this.unregisterOnLoadEvents;
//   };

//   // onLoad event handlers

//   handleJoinRoom = async (response: SocketResponse<JoinRoom>) => {
//     if (!response.data) {
//       console.error(response.error);
//       return;
//     }

//     this.user.peerId = response.data.peerId;
//     this.user.roomName = response.data.roomName;

//     await this.loadDeviceRtpCapabilities();

//     const streamMedia = await this.getUserMedia();

//     console.log(`Joined room, room id: ${response.data.roomId}`);

//     if (streamMedia) {
//       await this.produceMedia(streamMedia);
//     }

//     this.socket.emit("get-all-peers", this.handleGetAllPeers);

//     this.socket.on("new-producer", this.handleNewProducer);

//     this.socket.on("producer-closed", this.handleProducerClosed);

//     this.socket.on("peer-config", this.handlePeerConfig);

//     this.socket.on("active-speaker", this.handleActiveSpeaker);

//     this.socket.on("dominant-speaker", this.handleDominantSpeaker);
//   };

//   handleGetAllPeers = async (response: SocketResponse<GetAllPeers>) => {
//     if (!response.data) {
//       console.error(response.error);
//       return;
//     }

//     this.peers = response.data.peers;

//     console.log("All Peers:", this.peers);

//     for (const peer of this.peers) {
//       for (const producer of peer.producers) {
//         await this.consumeMedia(producer);

//         console.log(
//           `GetAllPeers: Subscribed to producer with id: ${producer.producerId}, kind: ${producer.kind}`
//         );
//       }
//     }

//     this.onLocalUserUpdated?.(this.userInfo);
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   handleNewProducer = async ({ request }: SocketEmitEvent<NewProducer>) => {
//     const { peer: newProducer } = request;

//     const peer = this.peers.find((u) => u.peerId === newProducer.peerId);

//     if (peer) {
//       console.log("Existing Peer Found", peer);

//       for (const _producer of newProducer.producers) {
//         if (
//           Boolean(
//             peer.producers.find((p) => p.producerId === _producer.producerId)
//           )
//         ) {
//           continue; // already consumed
//         }

//         peer.producers.push(_producer);

//         await this.consumeMedia(_producer);

//         console.log(
//           `New Producer: Subscribed to producer with id: ${_producer.producerId}, kind: ${_producer.kind}`
//         );
//       }
//     } else {
//       this.peers.push(newProducer);

//       for (const _producer of newProducer.producers) {
//         await this.consumeMedia(_producer);

//         console.log(
//           `New Producer: Subscribed to producer with id: ${_producer.producerId}, kind: ${_producer.kind}`
//         );
//       }
//     }

//     // this.producers.set(producer.producerId, producer);

//     // await this.consumeMedia(producer);
//     // const peer = this.peers.find((u) => u.peerId === newProducer.peerId);

//     // if (peer) {
//     //   console.log("Existing Peer Found", peer);
//     //   for (const producer of newProducer.producers) {
//     //     if (peer.producers.find((p) => p.producerId === producer.producerId))
//     //       continue; // already consumed
//     //     peer.producers.push(producer); // add the new producer to the user's producers list

//     //     await this.consumeMedia(producer);

//     //     console.log(
//     //       `New Producer: Subscribed to producer with id: ${producer.producerId}, kind: ${producer.kind}`
//     //     );
//     //   }
//     // } else {
//     //   this.peers.push(newProducer); // add the new user to the users list

//     //   for (const producer of newProducer.producers) {
//     //     await this.consumeMedia(producer);

//     //     console.log(
//     //       `New Producer: Subscribed to producer with id: ${producer.producerId}, kind: ${producer.kind}`
//     //     );
//     //   }
//     // }

//     this.onLocalUserUpdated?.(this.userInfo);
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   handleProducerClosed = async ({
//     request,
//   }: SocketEmitEvent<ProducerClosed>) => {
//     const { producerId } = request;

//     console.log("Producer Closed with id:", producerId);

//     this.consumers.forEach((_consumer) => {
//       if (_consumer.producerId === producerId) {
//         _consumer.close();
//         this.consumers.delete(_consumer.id);
//       }
//     });

//     this.msProducers.forEach((_producer) => {
//       if (_producer.id === producerId) {
//         _producer.close();
//         this.msProducers.delete(_producer.id);
//         const streamToClose = this.producers.get(_producer.id);
//         streamToClose?.stream?.getTracks().forEach((track) => track.stop());
//         this.producers.delete(_producer.id);
//       }
//     });

//     this.peers = this.peers.map((_peer) =>
//       _peer.producers.some((producer) => producer.producerId === producerId)
//         ? {
//             ..._peer,
//             producers: _peer.producers.filter(
//               (_p) => _p.producerId !== producerId
//             ),
//           }
//         : _peer
//     );

//     // let producerToClose: ProducerWithStream | undefined;

//     // for (const peer of this.peers) {
//     //   producerToClose = peer.producers.find((p) => p.producerId === producerId);
//     //   if (producerToClose) {
//     //     peer.producers = peer.producers.filter(
//     //       (p) => p.producerId !== producerId
//     //     );
//     //     break;
//     //   }
//     // }

//     // producerToClose?.stream?.getTracks().forEach((track) => track.stop());
//     // producerToClose?.stream?.getVideoTracks().forEach((track) => track.stop());

//     // const ownMSProducer = this.msProducers.get(producerId);
//     // ownMSProducer?.close();

//     // this.producers.delete(producerId);

//     this.onLocalUserUpdated?.(this.userInfo);
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   handlePeerConfig = async ({
//     request: peerConfig,
//   }: SocketEmitEvent<PeerConfig>) => {
//     const { userId } = peerConfig;

//     this.peers = this.peers.map((p) => {
//       if (p.userId === userId) {
//         p.peerConfig = { ...peerConfig };
//         return p;
//       } else {
//         return p;
//       }
//     });

//     this.onProducersUpdated?.([...this.peers]);
//   };

//   handleActiveSpeaker = async ({ request }: SocketEmitEvent<ActiveSpeaker>) => {
//     const { peerId, volume } = request;

//     const activeVolumePeerIndex = this.peers.findIndex(
//       (peer) => peer.peerId === peerId
//     );

//     if (activeVolumePeerIndex === -1) return; // Peer not found

//     const activeVolumePeer = this.peers[activeVolumePeerIndex];

//     this.peers.splice(activeVolumePeerIndex, 1); // remove the active speaker from the list
//     this.peers.unshift(activeVolumePeer); // add the active speaker to the beginning of the list

//     console.log("Active Speaker Peer ID:", peerId, "Volume:", volume);
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   handleDominantSpeaker = async ({
//     request,
//   }: SocketEmitEvent<DominantSpeaker>) => {
//     const { peerId } = request;

//     const activeVolumePeerIndex = this.peers.findIndex(
//       (peer) => peer.peerId === peerId
//     );

//     if (activeVolumePeerIndex === -1) return; // Peer not found

//     const activeVolumePeer = this.peers[activeVolumePeerIndex];

//     this.peers.splice(activeVolumePeerIndex, 1); // remove the active speaker from the list
//     this.peers.unshift(activeVolumePeer); // add the active speaker to the beginning of the list

//     console.log("Dominant Speaker Peer ID:", peerId);
//     this.onProducersUpdated?.([...this.peers]);
//   };

//   unregisterOnLoadEvents: MediasoupEventsCleaner = () => {
//     this.socket.off("new-producer", this.handleNewProducer);

//     this.socket.off("producer-closed", this.handleProducerClosed);

//     this.socket.off("active-speaker", this.handleActiveSpeaker);

//     this.socket.off("dominant-speaker", this.handleDominantSpeaker);

//     this.socket.off("peer-config", this.handlePeerConfig);
//   };

//   // Emit Events to Server

//   closeProducer = (producer: ProducerWithStream) => {
//     this.socket.emit(
//       "close-producer",
//       { producerId: producer.producerId },
//       (response) => {
//         if (!response.data) {
//           console.error(response.error);
//           return;
//         }

//         this.producers.delete(producer.producerId);

//         this.onLocalUserUpdated?.(this.userInfo);
//       }
//     );
//   };

//   updatePeerConfig = (config: PeerConfig) => {
//     this.socket.emit("peer-config", config, (response) => {
//       if (!response.data) {
//         console.error(response.error);
//         return;
//       }

//       this.user.peerConfig = { ...config };

//       this.onLocalUserUpdated?.({ ...this.user });
//     });
//   };
// }

// export type MediasoupEventsCleaner = () => void;
