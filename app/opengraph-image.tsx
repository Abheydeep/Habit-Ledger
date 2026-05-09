import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Win List daily wins tracker";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#071411",
          color: "#f3fbf7",
          padding: 72,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 0
          }}
        >
          <div
            style={{
              width: 86,
              height: 86,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              background: "#f5f7f2",
              color: "#0f766e",
              boxShadow: "0 20px 50px rgba(15, 118, 110, 0.35)"
            }}
          >
            ✓
          </div>
          The Win List
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              maxWidth: 900,
              fontSize: 78,
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: 0
            }}
          >
            Track your daily wins. Keep the streak alive.
          </div>
          <div style={{ maxWidth: 760, color: "#cfe3dc", fontSize: 34, lineHeight: 1.25 }}>
            Core habits, optional routines, mood status, reminders, and offline-first progress.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#f3fbf7"
          }}
        >
          <span style={{ color: "#f59e0b", fontWeight: 800 }}>Free. No signup. Works offline.</span>
          <span>mywinlist.com</span>
        </div>
      </div>
    ),
    size
  );
}
