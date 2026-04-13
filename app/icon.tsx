import { ImageResponse } from "next/og";

export const size = {
  width: 48,
  height: 48,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a 0%, #2563eb 100%)",
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "Arial, sans-serif",
          borderRadius: 10,
        }}
      >
        F
      </div>
    ),
    size
  );
}
