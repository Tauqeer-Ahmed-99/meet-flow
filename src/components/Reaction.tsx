import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { Reaction } from "../services/socket-types";

const Reaction = ({
  reaction,
  self,
}: {
  reaction: Reaction;
  self?: boolean;
}) => {
  const getReactionAnimationURL = (reaction: Reaction) => {
    switch (reaction) {
      case "clap":
        return "https://lottie.host/6f1f4d0d-401d-4ba8-b9f5-84659b88e0f6/KQtUflG5HF.lottie";
      case "love":
        return "https://lottie.host/61c03a77-6a70-4ad0-9a60-b6307f7f067f/ryLcu5T6Bk.lottie";
      case "celebrate":
        return "https://lottie.host/0abe3d7c-7fd4-42f3-b2a5-882178aad29a/5o19OsxZdB.lottie";
      default:
        return "https://lottie.host/6f1f4d0d-401d-4ba8-b9f5-84659b88e0f6/KQtUflG5HF.lottie";
    }
  };

  return (
    <div
      className={
        "absolute top-0 left-0 flex items-center justify-center w-full h-full bg-black/30 " +
        (self ? "z-40" : "z-20")
      }
    >
      <DotLottieReact
        src={getReactionAnimationURL(reaction)}
        loop
        autoplay
        className={reaction === "clap" ? "w-64 h-64" : "w-full h-full"}
      />
    </div>
  );
};

export default Reaction;
