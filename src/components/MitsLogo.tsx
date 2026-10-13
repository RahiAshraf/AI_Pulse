import { cn } from "@/lib/utils";

const LOGO_SRC = "/mits-logo.png";

export function MitsLogo({
  className,
  alt = "Madanapalle Institute of Technology & Science official logo",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      loading="eager"
      decoding="async"
      className={cn("w-auto h-auto max-w-full object-contain", className)}
    />
  );
}