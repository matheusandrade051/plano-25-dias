"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { btnPrimaryCls } from "./ui";

export function SubmitButton({
  children,
  className = btnPrimaryCls,
  pendingText = "Salvando...",
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
