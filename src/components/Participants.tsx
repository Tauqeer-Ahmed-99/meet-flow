import { useUser } from "@clerk/clerk-react";
import { Participant } from "../utils/types";

const Participants = ({ participants }: { participants: Participant[] }) => {
  const { user } = useUser();

  return (
    <div className="space-y-2">
      {participants.map((participant) => (
        <div
          key={participant.userId}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a3a1] flex items-center justify-center">
              <span className="text-white">{participant.name[0]}</span>
            </div>
            <div>
              <p className="font-medium text-white">{participant.name}</p>
              {participant.userId === user?.id && (
                <p className="text-sm text-white/60">You</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Participants;
