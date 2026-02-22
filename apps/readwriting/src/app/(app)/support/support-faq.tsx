"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I get started?",
    answer: "Explore the dashboard to see what's available. This is your home base where you'll find all your content and tools.",
  },
  {
    question: "How do I update my profile?",
    answer: "Go to Settings from the menu to change your display name.",
  },
  {
    question: "How do I delete my account?",
    answer: "Visit Settings and scroll to the bottom. You'll find the option to permanently delete your account. You'll need to type DELETE to confirm.",
  },
  {
    question: "How do I contact support?",
    answer: "Use the form below to send us a message. We'll get back to you as soon as we can.",
  },
];

export function SupportFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {faqs.map((faq, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between py-4 text-left cursor-pointer min-h-[44px]"
          >
            <span className="text-lg font-medium text-foreground pr-4">{faq.question}</span>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          {openIndex === index && (
            <p className="pb-4 text-base text-muted-foreground">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
