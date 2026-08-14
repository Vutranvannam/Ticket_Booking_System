import { useRef } from "react";
import type { ClipboardEvent } from "react";

export interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = (value + "      ").split("").slice(0, 6);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const val = e.target.value;
    const justDigits = val.replace(/\D/g, "");
    
    if (justDigits.length === 1) {
      const next = digits.map((d, i) => (i === index ? justDigits : d));
      onChange(next.join("").trimEnd());
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (justDigits.length > 1) {
      const pasted = justDigits.slice(0, 6 - index);
      const next = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        next[index + i] = pasted[i];
      }
      onChange(next.join("").trimEnd());
      const nextIndex = Math.min(index + pasted.length, 5);
      inputsRef.current[nextIndex]?.focus();
    } else if (val === "") {
      const next = digits.map((d, i) => (i === index ? " " : d));
      onChange(next.join("").trimEnd());
    }
  }

  function handleKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (e.key === "Backspace") {
      if (digits[index] === " " || digits[index] === "") {
        e.preventDefault();
        if (index > 0) {
          const next = digits.map((d, i) => (i === index - 1 ? " " : d));
          onChange(next.join("").trimEnd());
          inputsRef.current[index - 1]?.focus();
        }
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = digits.map((d, i) => (i === index ? e.key : d));
      onChange(next.join("").trimEnd());
      if (index < 5) inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, 5);
      inputsRef.current[nextIndex]?.focus();
    }
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            id={`otp-digit-${i}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit.trim()}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => handleKey(e, i)}
            onPaste={handlePaste}
            onChange={(e) => handleChange(e, i)}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all
              ${error
                ? "border-danger focus:ring-danger"
                : "border-border focus:border-primary-400"
              }`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}
