import { CustomMediaKind, Reaction } from "../services/socket-types";

export interface Participant {
  id: string;
  userId: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isPinned: boolean;
  kind: CustomMediaKind;
  stream?: MediaStream;
  reaction: Reaction;
  hasRaisedHand: boolean;
}
