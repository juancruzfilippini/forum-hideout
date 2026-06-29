"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";

type ServerAction = (formData: FormData) => void | Promise<void>;

export function ConfirmReasonDialog({
  action,
  hiddenFields,
  triggerLabel,
  title,
  description,
  reasonLabel = "Motivo interno",
  reasonPlaceholder = "Escribe el motivo",
  confirmLabel,
  disabled = false,
}: {
  action: ServerAction;
  hiddenFields: Record<string, string>;
  triggerLabel: string;
  title: string;
  description: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)} size="sm" type="button" variant="danger">
        {triggerLabel}
      </Button>

      {open ? (
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-md border border-stone-700 bg-stone-950 p-5 shadow-2xl">
            <h2 className="text-xl font-bold text-stone-50" id={titleId}>
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-400" id={descriptionId}>
              {description}
            </p>

            <form action={action} className="mt-5 grid gap-4">
              {Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))}
              <label className="grid gap-2 text-sm font-medium text-stone-300">
                {reasonLabel}
                <textarea
                  className="min-h-28 w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20"
                  maxLength={180}
                  name="reason"
                  placeholder={reasonPlaceholder}
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2">
                <Button onClick={() => setOpen(false)} type="button" variant="secondary">
                  Cancelar
                </Button>
                <Button type="submit" variant="danger">
                  {confirmLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
