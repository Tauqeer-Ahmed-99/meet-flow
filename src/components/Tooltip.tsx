// Tooltip.jsx
import { PropsWithChildren, ReactNode, useState } from "react";

const Tooltip = ({
  children,
  element,
  position = "top",
}: {
  element: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
} & PropsWithChildren) => {
  const [show, setShow] = useState(false);

  // Positioning classes
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0} // for keyboard accessibility
    >
      {children}
      {show && (
        <div
          className={`absolute z-10 px-3 py-1.5 rounded bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none transition-opacity duration-200 opacity-100 ${positionClasses[position]}`}
        >
          {element}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
