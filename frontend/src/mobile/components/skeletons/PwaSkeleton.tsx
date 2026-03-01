import type { CSSProperties } from "react";

type PwaSkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

export default function PwaSkeleton({ className, style }: PwaSkeletonProps) {
  const classes = ["pwa-skeleton", className].filter(Boolean).join(" ");
  return <div aria-hidden="true" className={classes} style={style} />;
}
