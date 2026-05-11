"use client";

import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { mockFaqs } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { GlassCard } from "@/components/ui-extras/GlassCard";
import { Reveal } from "@/components/ui-extras/Reveal";

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader title="FAQs" subtitle="Frequently asked questions about Menu Gap" />

        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-2xl border border-[#E7DED2] p-6 glass-strong">
            <div className="relative flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-[#7F5539]/40 blur-lg" />
                <div className="relative w-12 h-12 rounded-xl bg-[#7F5539] flex items-center justify-center shadow-[0_4px_12px_rgba(127,85,57,0.25)]">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="mb-2">Need more help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                </p>
                <button
                  className="px-4 py-2 bg-[#7F5539] text-white rounded-lg hover:opacity-90 transition-opacity text-sm shadow-[0_4px_12px_rgba(127,85,57,0.25)]"
                  style={{ fontWeight: 600 }}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <GlassCard>
            <div className="p-6 border-b border-border">
              <h3>Frequently Asked Questions</h3>
            </div>

            <div className="divide-y divide-border">
              {mockFaqs.map((faq, index) => {
                const open = openIndex === index;
                return (
                  <div key={index} className="transition-colors">
                    <button
                      onClick={() => setOpenIndex(open ? null : index)}
                      className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                        open ? "bg-[#F4ECE3]" : "hover:bg-[#FCF8F3]"
                      }`}
                    >
                      <h4 className="pr-4 flex items-center gap-3">
                        {open && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B08968]" />
                        )}
                        {faq.question}
                      </h4>
                      {open ? (
                        <ChevronUp className="w-5 h-5 text-[#B08968] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {open && (
                      <div className="px-6 pb-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </Reveal>

        <div className="grid grid-cols-3 gap-6">
          <Reveal delay={300}>
            <QuickLinkCard
              title="Getting Started"
              body="Learn the basics of Menu Gap and how to interpret your data."
              cta="View Guide →"
            />
          </Reveal>
          <Reveal delay={360}>
            <QuickLinkCard
              title="Data & Privacy"
              body="Understand how we collect, use, and protect your cafe's data."
              cta="Read Policy →"
            />
          </Reveal>
          <Reveal delay={420}>
            <QuickLinkCard
              title="Best Practices"
              body="Tips from successful cafe owners on using Menu Gap effectively."
              cta="Learn More →"
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <GlassCard interactive className="p-6">
      <h4 className="mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{body}</p>
      <button className="text-sm text-[#B08968] hover:text-[#7F5539] transition-colors" style={{ fontWeight: 600 }}>
        {cta}
      </button>
    </GlassCard>
  );
}
