import React from "react";
import {
  Mic,
  Video,
  PhoneOff,
  ScreenShare,
  MessageSquare,
  Users,
  Settings,
  Hand,
} from "lucide-react";

import Reactions from "./Reactions";
import { Reaction } from "../services/socket-types";

interface ControlBarProps {
  isMuted: boolean;
  isVideoOn: boolean;
  hasRaisedHand: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => Promise<void>;
  onEndCall: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onOpenSettings: () => void;
  onReaction: (reaction: Reaction) => void;
  onToggleRaisedHand: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoOn,
  hasRaisedHand,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  onReaction,
  onToggleRaisedHand,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-lg">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-full ${
              isMuted
                ? "bg-red-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-full ${
              !isVideoOn
                ? "bg-red-500 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Video className="w-6 h-6" />
          </button>
          <button
            className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
            onClick={onToggleScreenShare}
          >
            <ScreenShare className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChat}
            className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button
            className={`p-3 text-white rounded-full bg-white/10 hover:bg-white/20 ${
              hasRaisedHand ? "bg-white/50" : ""
            }`}
            onClick={onToggleRaisedHand}
          >
            <Hand className="w-6 h-6" />
          </button>
          {/* <Tooltip
            element={
              <div>
                <DotLottieReact
                  src="https://lottie.host/0abe3d7c-7fd4-42f3-b2a5-882178aad29a/5o19OsxZdB.lottie"
                  loop
                  autoplay
                />
              </div>
            }
          >
            <button className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20">
              <Smile className="w-6 h-6" />
            </button>
          </Tooltip> */}
          <Reactions onReaction={onReaction} />
          <button
            onClick={onToggleParticipants}
            className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={onEndCall}
          className="flex items-center gap-2 p-3 px-6 text-white bg-red-500 rounded-full hover:bg-red-600"
        >
          <PhoneOff className="w-6 h-6" />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
