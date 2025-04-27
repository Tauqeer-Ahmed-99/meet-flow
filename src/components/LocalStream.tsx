// import { useEffect, useRef } from "react";
// import { Mic, MicOff, Pin } from "lucide-react";
// import { Participant } from "../utils/types";
// import Reaction from "./Reaction";

// const LocalStream = ({ participant }: { participant: Participant }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     if (participant.kind === "video" && videoRef.current) {
//       videoRef.current.srcObject = participant.stream as MediaStream;

//       videoRef.current.onloadedmetadata = () => {
//         try {
//           videoRef.current?.play();
//         } catch (error) {
//           //ask for permission to play the video
//         }
//       };
//     }

//     if (participant.kind === "audio" && audioRef.current) {
//       audioRef.current.srcObject = participant.stream as MediaStream;

//       audioRef.current.onloadedmetadata = () => {
//         try {
//           audioRef.current?.play();
//         } catch (error) {
//           //ask for permission to play the audio
//         }
//       };
//     }
//   }, [participant.stream, participant.kind]);

//   return (
//     <div className="z-30 fixed max-w-64 min-w-64 aspect-video bottom-24 right-12 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden group flex justify-center items-center">
//       {participant.reaction && participant.reaction !== "none" && (
//         <Reaction reaction={participant.reaction} />
//       )}
//       {participant.isVideoOn ? (
//         <div className="h-full">
//           <video
//             ref={videoRef}
//             className="object-cover w-full h-full scale-x-[-1]"
//             autoPlay
//             playsInline
//             muted
//           />
//         </div>
//       ) : (
//         <div className="flex items-center justify-center w-full h-full">
//           <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
//             <span className="text-2xl text-white">
//               {participant.name.charAt(0).toUpperCase()}
//             </span>
//           </div>
//         </div>
//       )}

//       <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
//         <div className="flex items-center justify-between">
//           <span className="font-medium text-white">{participant.name}</span>
//           <div className="flex items-center gap-2">
//             <audio ref={audioRef} autoPlay playsInline muted />
//             {participant.isMuted ? (
//               <MicOff className="w-4 h-4 text-red-500" />
//             ) : (
//               <Mic className="w-4 h-4 text-white" />
//             )}
//             <button className="transition-opacity opacity-0 group-hover:opacity-100">
//               <Pin className="w-4 h-4 text-white hover:text-violet-400" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LocalStream;

import { useEffect, useRef } from "react";
import { Mic, MicOff, Pin } from "lucide-react";
import { Participant } from "../utils/types";
import Reaction from "./Reaction";
import { PinPeerConfig } from "../services/socket-types";

const LocalStream = ({
  participant,
  onPinToggled,
}: {
  participant: Participant;
  onPinToggled: (pinConfig: PinPeerConfig) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attach video stream if video is on
    if (videoRef.current && participant.isVideoOn) {
      videoRef.current.srcObject = participant.stream as MediaStream;
      videoRef.current.onloadedmetadata = () => {
        try {
          videoRef.current?.play();
        } catch (error) {
          // handle permission error
        }
      };
    }
    // Attach audio stream if audio is on
    if (audioRef.current && !participant.isMuted) {
      audioRef.current.srcObject = participant.stream as MediaStream;
      audioRef.current.onloadedmetadata = () => {
        try {
          audioRef.current?.play();
        } catch (error) {
          // handle permission error
        }
      };
    }
  }, [participant.stream, participant.isVideoOn, participant.isMuted]);

  const handlePinToggle = () => {
    const pinConfig = {
      userId: participant.userId,
      isPinned: !participant.isPinned,
    };
    onPinToggled(pinConfig);
  };

  // UI for video and audio both ON
  const renderVideoAndAudio = () => (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className="object-cover w-full h-full scale-x-[-1]"
        autoPlay
        playsInline
        muted
      />
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );

  // UI for only audio ON
  const renderAudioOnly = () => (
    <div className="flex items-center justify-center w-full h-full">
      <audio ref={audioRef} autoPlay playsInline />
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
        <span className="text-2xl text-white">
          {participant.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );

  // UI for only video ON
  const renderVideoOnly = () => (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className="object-cover w-full h-full scale-x-[-1]"
        autoPlay
        playsInline
        muted
      />
    </div>
  );

  // Decide which UI to render
  let content;
  if (participant.isVideoOn && !participant.isMuted) {
    content = renderVideoAndAudio();
  } else if (!participant.isVideoOn && !participant.isMuted) {
    content = renderAudioOnly();
  } else if (participant.isVideoOn && participant.isMuted) {
    content = renderVideoOnly();
  } else {
    // Both off: show avatar only
    content = (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
          <span className="text-2xl text-white">
            {participant.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="z-30 fixed max-w-64 min-w-64 aspect-video bottom-24 right-12 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden group flex justify-center items-center">
      {participant.reaction && participant.reaction !== "none" && (
        <Reaction reaction={participant.reaction} />
      )}

      {content}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{participant.name}</span>
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <MicOff className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
            <button
              className="transition-opacity opacity-0 group-hover:opacity-100"
              onClick={handlePinToggle}
            >
              <Pin className="w-4 h-4 text-white hover:text-violet-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalStream;
