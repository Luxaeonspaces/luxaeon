import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4A0E0E 0%, #7A1F1F 35%, #E8D9B5 100%)",
          color: "#F7F5F0",
          fontFamily: "sans-serif",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: 48,
            borderRadius: 32,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>
            Luxaeon Spaces
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, marginTop: 18, lineHeight: 1.1 }}>
            Interior Design Studio
          </div>
          <div style={{ fontSize: 32, marginTop: 18, opacity: 0.9 }}>
            Business OS · Design · Project Flow · Client Experience
          </div>
        </div>
      </div>
    ),
    size,
  );
}
