"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { scrollToIdWhenReady } from "@/lib/scroll/scroll";

type ScrollButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  targetId: string;
  children: ReactNode;
};

export function ScrollButton({
  targetId,
  onClick,
  children,
  ...props
}: ScrollButtonProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    scrollToIdWhenReady(targetId);
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
