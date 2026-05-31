import { Mic } from "lucide-react";

export function MicLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(180deg, rgba(34,211,238,0.18), rgba(168,85,247,0.18))",
        boxShadow: "0 0 24px rgba(99,102,241,0.4), inset 0 0 0 1px rgba(99,102,241,0.4)",
      }}
    >
      <Mic
        size={Math.round(size * 0.5)}
        className="text-cyan-300"
        strokeWidth={2.2}
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.7))" }}
      />
    </div>
  );
}
