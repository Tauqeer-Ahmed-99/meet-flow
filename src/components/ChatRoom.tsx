import { useState } from "react";
import { Send } from "lucide-react";
import { PeerMessage } from "../services/socket-types";
import { useUser } from "@clerk/clerk-react";

const MessageInput = ({
  onPeerMessage,
}: {
  onPeerMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");

  return (
    <div className="p-4 border-t border-white/10">
      <div className="relative">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full bg-white/10 text-white placeholder-white/60 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00a3a1]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="absolute p-2 transform -translate-y-1/2 rounded-full right-2 top-1/2 hover:bg-white/10"
          onClick={() => {
            onPeerMessage(message.trim());
            setMessage("");
          }}
        >
          <Send className="w-5 h-5 text-[#00a3a1]" />
        </button>
      </div>
    </div>
  );
};

const ChatRoom = ({
  peerMessages,
  onPeerMessage,
}: {
  peerMessages: PeerMessage[];
  onPeerMessage: (message: string) => void;
}) => {
  const { user } = useUser();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Chat messages would go here */}

        {peerMessages.map((message, index) => (
          <div key={message.userId + index} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00a3a1] flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-white">{message.name[0]}</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-white">
                  {message.userId === user?.id ? "You" : message.name}
                </span>
                <span className="text-xs text-white/60">
                  {message.timestamp}
                </span>
              </div>
              <p className="mt-1 text-white/80">{message.message}</p>
            </div>
          </div>
        ))}
      </div>
      <MessageInput onPeerMessage={onPeerMessage} />
    </div>
  );
};

export default ChatRoom;
