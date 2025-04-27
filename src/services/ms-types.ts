export type TransportId = string;

export type ProducerId = string;

export type ConsumerId = string;

export interface MediasoupExtraConfig {
  actionSounds?: {
    playAudio?: {
      onPeerJoin?: boolean;
      onPeerLeft?: boolean;
      onPeerMessage?: boolean;
    };
    audioSrc?: {
      peerJoinSoundPath?: string;
      peerLeftSoundPath?: string;
      peerMessageSoundPath?: string;
    };
  };
}
