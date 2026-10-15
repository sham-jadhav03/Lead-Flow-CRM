"use client";
import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Accessible dialog shell (focus trap, Esc to close, labelled) shared by both dialogs. */
export default function Modal({ open, onOpenChange, title, description, actions, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-2xl">
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description className={description ? "mt-0.5 text-sm text-ink/60" : "sr-only"}>
                {description ?? title}
              </Dialog.Description>
            </div>
            {actions}
            <Dialog.Close aria-label="Close" className="-mr-1 rounded-md p-1 text-ink/50 hover:bg-paper hover:text-ink">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
