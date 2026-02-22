"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsFormProps {
  currentName: string;
  email: string;
}

export function SettingsForm({ currentName, email }: SettingsFormProps) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Display Name"
        defaultValue={currentName}
        placeholder="Enter your name"
      />
      <div className="space-y-2">
        <label className="block text-base font-medium text-foreground">Email</label>
        <p className="text-base text-foreground">{email}</p>
        <p className="text-sm text-muted-foreground">
          This is the email you use to sign in and cannot be changed.
        </p>
      </div>
      {success && (
        <p className="text-base text-green-700 font-medium">Profile updated successfully</p>
      )}
      <Button type="submit" loading={loading}>
        Save Changes
      </Button>
    </form>
  );
}
