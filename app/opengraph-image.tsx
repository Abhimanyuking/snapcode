import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SnapCode — Screenshot to Code in Seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Pink glow */}
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "25%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#a855f7",
            }}
          >
            {"</>"}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
            }}
          >
            SnapCode
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            marginBottom: "16px",
            display: "flex",
            gap: "16px",
          }}
        >
          Screenshot to{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Code
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#9ca3af",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          Upload any UI screenshot. Get clean code in seconds.
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "32px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#a855f7",
              background: "rgba(168,85,247,0.1)",
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            Free &middot; No signup required
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
