import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { formatInr } from "@/lib/money";
import { getAudit } from "@/lib/store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) return {};
  const title = `${formatInr(audit.totalMonthlySavings)}/mo AI savings found`;
  const description = `SpendCheck AI audited ${audit.input.tools.length} tools and found ${formatInr(audit.totalAnnualSavings)}/yr in potential savings.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicAuditPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  return (
    <main className="public-page">
      <section className="public-hero">
        <p className="eyebrow">Public SpendCheck AI report</p>
        <h1>{formatInr(audit.totalMonthlySavings)}/mo in potential AI savings</h1>
        <p>{audit.summary}</p>
        <Link href="/">Run your own audit</Link>
      </section>
      <section className="public-results">
        {audit.recommendations.map((item) => (
          <article key={item.toolId + item.currentPlan}>
            <div>
              <h2>{item.toolName}</h2>
              <p>{item.currentPlan} &rarr; {item.recommendedPlan}</p>
            </div>
            <strong>{formatInr(item.monthlySavings)}/mo</strong>
            <p>{item.reason}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
