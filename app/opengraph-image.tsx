import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 100%)",
          color: "white",
          padding: "56px 64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 0.2 }}>
            FENI Circular
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 900 }}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>
            Ropa infantil circular
          </div>
          <div style={{ fontSize: 30, opacity: 0.92, lineHeight: 1.25 }}>
            Comprá y vendé prendas en excelente estado.
          </div>
        </div>

        <div style={{ fontSize: 26, opacity: 0.9 }}>fenicircular.com</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
