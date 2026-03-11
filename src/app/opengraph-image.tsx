import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gobia — Gestión pública inteligente para Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F8F8F6",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#B8956A",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#B8956A",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#B8956A",
            }}
          >
            Plataforma GovTech
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#1A1A1A",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: "24px",
          }}
        >
          Gestión pública
          <br />
          <span style={{ color: "#B8956A" }}>inteligente</span> para
          <br />
          Colombia
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "#737373",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "600px",
          }}
        >
          Hacienda, planeación y normativa en una sola plataforma.
        </p>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#1A1A1A" }}>
              gobia
            </span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#B8956A" }}>
              .co
            </span>
          </div>
          <span style={{ fontSize: "16px", color: "#A3A3A3" }}>
            inplux.co · tribai.co · fourier.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
