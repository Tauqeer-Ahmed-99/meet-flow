import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Smile } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Reaction } from "../services/socket-types";

export default function Reactions({
  onReaction,
}: {
  onReaction: (reaction: Reaction) => void;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton
          as="div"
          className="flex items-center text-gray-400 rounded-full hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
        >
          <span className="sr-only">Open options</span>
          {/* <FaceSmileIcon aria-hidden="true" className="size-5" /> */}
          <button className="p-3 text-white rounded-full bg-white/10 hover:bg-white/20">
            <Smile className="w-6 h-6" />
          </button>
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 transition origin-bottom-right rounded-md shadow-lg bg-white/10 bottom-12 ring-1 ring-black/5 focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="flex py-1">
          <MenuItem>
            <DotLottieReact
              src="https://lottie.host/6f1f4d0d-401d-4ba8-b9f5-84659b88e0f6/KQtUflG5HF.lottie"
              loop
              autoplay
              className="w-24 h-24 cursor-pointer hover:scale-150"
              onClick={() => onReaction("clap")}
            />
          </MenuItem>
          <MenuItem>
            <DotLottieReact
              src="https://lottie.host/61c03a77-6a70-4ad0-9a60-b6307f7f067f/ryLcu5T6Bk.lottie"
              loop
              autoplay
              className="w-24 h-24 cursor-pointer hover:scale-150"
              onClick={() => onReaction("love")}
            />
          </MenuItem>
          <MenuItem>
            <DotLottieReact
              src="https://lottie.host/0abe3d7c-7fd4-42f3-b2a5-882178aad29a/5o19OsxZdB.lottie"
              loop
              autoplay
              className="w-24 h-24 cursor-pointer hover:scale-150"
              onClick={() => onReaction("celebrate")}
            />
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
