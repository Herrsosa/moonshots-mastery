"use client";
import { useRef } from "react";
import { Send, Mic } from "lucide-react";
import { playClick } from "@/lib/sounds";

export function AnswerInput({
  value, onChange, onSubmit, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  function fireSubmit() {
    playClick();
    onSubmit();
  }
  return (
    <div className="panel rounded-2xl p-3 flex items-end gap-2">
      <textarea
        ref={ref}
        rows={3}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            fireSubmit();
          }
        }}
        placeholder="Type your answer… (⌘↩ to submit)"
        className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-ink-faint text-ink leading-relaxed px-2 py-1.5 max-h-48"
      />
      <button
        type="button"
        title="Voice mode coming soon"
        disabled
        className="size-10 rounded-xl panel-soft grid place-items-center text-ink-faint opacity-60 cursor-not-allowed"
      >
        <Mic size={16} />
      </button>
      <button
        onClick={fireSubmit}
        disabled={disabled || value.trim().length < 3}
        className="size-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 grid place-items-center text-cyan-100 disabled:opacity-40"
        style={{ boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
