import React from "react";
import { X, Search } from "lucide-react";
import ChatRoom from "./ChatRoom";
import Participants from "./Participants";
import { PeerMessage } from "../services/socket-types";
import { Participant } from "../utils/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  type: "chat" | "participants";
  peerMessages?: PeerMessage[];
  onPeerMessage?: (message: string) => void;
  participants?: Participant[];
}

const SearchBar = ({ type }: { type: "chat" | "participants" }) => {
  return (
    <div className="mt-4">
      <div className="relative">
        <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-white/60" />
        <input
          type="text"
          placeholder={
            type === "chat" ? "Search messages" : "Search participants"
          }
          className="w-full bg-white/10 text-white placeholder-white/60 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00a3a1]"
        />
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  type,
  peerMessages,
  onPeerMessage,
  participants,
}) => {
  return (
    <div
      className={`fixed z-[100] right-0 top-0 bottom-0 w-80 bg-[#1a2b4c]/95 backdrop-blur-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {type === "chat" ? "Meeting Chat" : "Participants"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <SearchBar type={type} />
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {type === "chat" && (
            <ChatRoom
              peerMessages={peerMessages ?? []}
              onPeerMessage={onPeerMessage ?? function () {}}
            />
          )}
          {type === "participants" && (
            <Participants participants={participants ?? []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
