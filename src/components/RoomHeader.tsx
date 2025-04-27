import { Check } from "lucide-react";
import { useState } from "react";

const RoomHeader = ({
  roomName,
  isSharingScreen,
}: {
  roomName: string;
  isSharingScreen: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyURl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between h-16 p-4 bg-black/20 backdrop-blur-lg">
      <h3 className="font-semibold text-white/90">{roomName}</h3>
      <div className="flex items-center justify-between gap-2">
        {isSharingScreen && (
          <h3 className="p-1 text-sm text-red-400 transition-all duration-300 border rounded-lg bg-red-400/5 hover:bg-red-400/10 backdrop-blur-lg border-red-400/10">
            Your screen is being shared.
          </h3>
        )}
        {copied ? (
          <div className="p-1 text-sm text-white transition-all duration-300 border rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-lg border-white/10">
            <Check color="#00b803" size={18} />
          </div>
        ) : (
          <button
            onClick={handleCopyURl}
            className="p-1 text-sm text-white transition-all duration-300 border rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-lg border-white/10"
          >
            Copy Meeting URL
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomHeader;
