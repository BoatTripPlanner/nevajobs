import { ImageResponse } from "next/og";

export function createPwaIcon(size: number, maskable = false) {
  const inset = maskable ? Math.round(size * 0.12) : 0;
  const radius = maskable ? 0 : Math.round(size * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: maskable
            ? "#0891b2"
            : "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: size - inset * 2,
            height: size - inset * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
            borderRadius: maskable ? 0 : Math.round((size - inset * 2) * 0.22),
            fontSize: Math.round((size - inset * 2) * 0.48),
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.05em",
          }}
        >
          N
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
