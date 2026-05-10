"use client";

import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { mockFaqs } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-6 space-y-6">
        <PageHeader title="FAQs" subtitle="Frequently asked questions about Menu Gap" />
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-2">Need more help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h3>Frequently Asked Questions</h3>
          </div>

          <div className="divide-y divide-border">
            {mockFaqs.map((faq, index) => (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/30 transition-colors"
                >
                  <h4 className="pr-4">{faq.question}</h4>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <QuickLinkCard title="Getting Started" body="Learn the basics of Menu Gap and how to interpret your data." cta="View Guide →" />
          <QuickLinkCard title="Data & Privacy" body="Understand how we collect, use, and protect your cafe's data." cta="Read Policy →" />
          <QuickLinkCard title="Best Practices" body="Tips from successful cafe owners on using Menu Gap effectively." cta="Learn More →" />
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h4 className="mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{body}</p>
      <button className="text-sm text-primary hover:text-primary/80">{cta}</button>
    </div>
  );
}
