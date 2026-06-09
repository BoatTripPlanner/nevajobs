"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { parseHashHref, scrollToIdWhenReady, updateHash } from "@/lib/scroll/scroll";

type ScrollLinkProps = ComponentProps<typeof Link>;

export function ScrollLink({ href, onClick, ...props }: ScrollLinkProps) {
  const pathname = usePathname();
  const hrefStr = typeof href === "string" ? href : "";
  const { path, hash } = parseHashHref(hrefStr);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !hash) return;

    const targetPath = path || "/";
    if (targetPath === pathname) {
      event.preventDefault();
      scrollToIdWhenReady(hash);
      updateHash(hash);
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
