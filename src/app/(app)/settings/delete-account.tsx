"use client";

import { useState } from "react";
import { deleteAccount } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteAccount();
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes("NEXT_REDIRECT") || (err as { digest?: string }).digest?.includes("NEXT_REDIRECT"))) {
        throw err;
      }
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Delete Account</h3>
        <p className="mt-1 text-base text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      {!showConfirm ? (
        <Button variant="destructive" onClick={() => setShowConfirm(true)}>
          Delete My Account
        </Button>
      ) : (
        <div className="rounded-lg border border-destructive/30 bg-red-50 p-6 space-y-4">
          <p className="text-base text-foreground">
            To confirm, type <strong>DELETE</strong> in the box below
          </p>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={loading}
              disabled={confirmText !== "DELETE"}
            >
              Permanently Delete Account
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
