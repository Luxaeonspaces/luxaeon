import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2D0A0A 0%, #4A0E0E 50%, #C9A96E 100%)",
          color: "#F7F5F0",
          fontFamily: "sans-serif",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, letterSpacing: 5, textTransform: "uppercase", opacity: 0.9 }}>
            Luxaeon Spaces
          </div>
          <div style={{ fontSize: 78, fontWeight: 700, marginTop: 18 }}>
            Design. Flow. Build.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
