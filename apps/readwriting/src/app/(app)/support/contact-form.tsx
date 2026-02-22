"use client";

import { useState } from "react";
import { submitContactForm } from "@/actions/support-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactFormProps {
  defaultName: string;
  defaultEmail: string;
}

export function ContactForm({ defaultName, defaultEmail }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitContactForm({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
      });
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Name"
        defaultValue={defaultName}
        required
      />
      <div className="space-y-2">
        <label htmlFor="contact-email" className="block text-base font-medium text-foreground">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={defaultEmail}
          readOnly
          className="flex h-12 w-full rounded-lg border border-border bg-muted px-4 text-base text-muted-foreground cursor-not-allowed"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="block text-base font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="How can we help?"
          className="flex w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring resize-y"
        />
      </div>
      {success && (
        <p className="text-base text-green-700 font-medium">
          Message sent! We&apos;ll get back to you soon.
        </p>
      )}
      {error && (
        <p className="text-base text-destructive">{error}</p>
      )}
      <Button type="submit" loading={loading}>
        Send Message
      </Button>
    </form>
  );
}
