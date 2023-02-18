import * as React from "react";
import { createComponent } from "@mui/toolpad-core";

const bytesFormat = new Intl.NumberFormat(undefined, {
  style: "unit",
  maximumSignificantDigits: 3,
  notation: "compact",
  unit: "byte",
  unitDisplay: "narrow",
  signDisplay: "always",
});

function prettyBytes(value: number) {
  return bytesFormat.format(value);
}

export interface ParsedProps {
  value: number;
}

function formatDiff(value: number): string {
  if (!value) {
    return "";
  }

  const trendIcon = value < 0 ? "▼" : "🔺";

  return `${prettyBytes(Math.abs(value))} ${trendIcon}`;
}

function Diff({ value }: ParsedProps) {
  return <>{formatDiff(value)}</>;
}

export default createComponent(Diff, {
  argTypes: {
    value: {
      typeDef: { type: "string" },
    },
  },
});
