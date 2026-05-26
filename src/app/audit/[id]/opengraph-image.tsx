import { ImageResponse } from "next/og";
import { formatInr } from "@/lib/money";
import { getAudit } from "@/lib/store";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  const savings = audit ? formatInr(audit.totalMonthlySavings) : "AI spend";
  const annual = audit ? formatInr(audit.totalAnnualSavings) : "in minutes";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101820",
          color: "white",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ color: "#78d6b6", fontSize: 30, fontWeight: 700 }}>SpendCheck AI</div>
        <div>
          <div style={{ fontSize: 88, lineHeight: 1, fontWeight: 800 }}>{savings}/mo</div>
          <div style={{ marginTop: 22, fontSize: 42, color: "#d9e1e7" }}>potential AI savings found</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#bdd2df" }}>
          <span>{annual}/yr</span>
          <span>Run your free audit</span>
        </div>
      </div>
    ),
    size,
  );
}
