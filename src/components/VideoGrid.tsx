import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import StreamTile from "./StreamTile";
import { Participant } from "../utils/types";
import { PinPeerConfig } from "../services/socket-types";

interface VideoGridProps {
  participants: Participant[];
  onPinToggled: (pinConfig: PinPeerConfig) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  onPinToggled,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const participantsPerPage = 6;
  const totalPages = Math.ceil(participants.length / participantsPerPage);

  const currentParticipants = participants.slice(
    currentPage * participantsPerPage,
    (currentPage + 1) * participantsPerPage
  );

  const gridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-3 grid-rows-3";
  };

  return (
    <div className="relative flex justify-center p-4">
      <div
        className={`grid gap-4 w-full max-w-4xl h-[calc(100vh-12rem)] ${gridClass(
          currentParticipants.filter((p) => p.kind === "video").length
        )}`}
      >
        {currentParticipants.map((participant) => (
          <StreamTile
            key={participant.id}
            participant={participant}
            onPinToggled={onPinToggled}
          />
        ))}

        {currentParticipants.length === 0 && (
          <div className="flex items-center justify-center text-xl text-zinc-500">
            Waiting for other participants to join.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="absolute flex items-center gap-4 transform -translate-x-1/2 bottom-20 left-1/2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <span className="text-white">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
