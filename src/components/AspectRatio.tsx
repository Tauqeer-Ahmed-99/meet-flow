import React, { PropsWithChildren } from "react";

export const AspectRatio: React.FC<
  { ratio?: number; className?: string } & PropsWithChildren
> = ({ ratio = 16 / 9, className = "", children }) => (
  <div className={`relative w-full ${className}`}>
    <div style={{ paddingTop: `${100 / ratio}%` }} />
    <div className="absolute inset-0">{children}</div>
  </div>
);
