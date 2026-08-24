"use client";

import { useState } from "react";

/** Formats thousands with commas while typing; stores raw number in a hidden field */
export default function AmountInput({
  name = "amount",
  placeholder = "Amount (₦)",
  defaultValue,
  required,
  className = "input",
}: {
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  className?: string;
}) {
  const initial = defaultValue != null && defaultValue !== "" ? Number(String(defaultValue).replace(/,/g, "")) : "";
  const [display, setDisplay] = useState(
    initial === "" || Number.isNaN(initial as number) ? "" : Number(initial).toLocaleString("en-NG")
  );
  const [raw, setRaw] = useState(initial === "" || Number.isNaN(initial as number) ? "" : String(initial));

  function onChange(v: string) {
    const cleaned = v.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const normalized = parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : parts[0];
    setRaw(normalized);
    if (!normalized) {
      setDisplay("");
      return;
    }
    const num = Number(normalized);
    if (Number.isNaN(num)) {
      setDisplay(v);
      return;
    }
    // format integer part with commas
    const [intPart, dec] = normalized.split(".");
    const withCommas = Number(intPart).toLocaleString("en-NG") + (dec != null ? "." + dec : "");
    setDisplay(withCommas);
  }

  return (
    <>
      <input
        type="text"
        inputMode="decimal"
        className={className}
        placeholder={placeholder}
        value={display}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete="off"
      />
      <input type="hidden" name={name} value={raw} />
    </>
  );
}
