"use client";

import { useState } from "react";
import { Eye, Settings } from "lucide-react";

import { ConfirmReasonDialog } from "@/components/confirm-reason-dialog";
import { Button } from "@/components/ui/button";

type ServerAction = (formData: FormData) => void | Promise<void>;

type TopicMenuTopic = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export function TopicAdminMenu({
  topic,
  categories,
  currentCategorySlug,
  hideAction,
  restoreAction,
  moveAction,
}: {
  topic: TopicMenuTopic;
  categories: CategoryOption[];
  currentCategorySlug: string;
  hideAction: ServerAction;
  restoreAction: ServerAction;
  moveAction: ServerAction;
}) {
  const [open, setOpen] = useState(false);
  const returnTo = `/topics/${topic.slug}`;
  const visibleCategories = categories.filter((category) => category.slug !== currentCategorySlug);

  return (
    <div className="absolute right-4 top-4 z-10">
      <Button
        aria-expanded={open}
        aria-label="Configuracion del tema"
        onClick={() => setOpen((current) => !current)}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Settings aria-hidden="true" size={16} />
      </Button>

      {open ? (
        <div className="absolute right-0 mt-2 w-72 rounded-md border border-stone-700 bg-stone-950 p-3 shadow-2xl">
          <p className="mb-3 text-xs font-semibold uppercase text-lime-300">Configuracion</p>

          {topic.status === "ARCHIVED" ? (
            <form action={restoreAction}>
              <input name="id" type="hidden" value={topic.id} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <Button className="w-full" size="sm" type="submit" variant="primary">
                <Eye aria-hidden="true" size={16} />
                Restaurar tema
              </Button>
            </form>
          ) : (
            <ConfirmReasonDialog
              action={hideAction}
              hiddenFields={{ id: topic.id, returnTo }}
              title={`Ocultar ${topic.title}`}
              description="El tema quedara oculto para usuarios normales y solo sera visible para Staff y Admin+."
              reasonPlaceholder="Motivo interno para ocultar"
              triggerLabel="Ocultar tema"
              confirmLabel="Confirmar ocultamiento"
            />
          )}

          {visibleCategories.length > 0 ? (
            <form action={moveAction} className="mt-3 grid gap-2 border-t border-stone-800 pt-3">
              <input name="id" type="hidden" value={topic.id} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <label className="grid gap-2 text-xs font-semibold uppercase text-stone-400">
                Redirigir a
                <select
                  className="h-9 w-full rounded-md border border-stone-700 bg-stone-950 px-3 text-sm normal-case text-stone-100 outline-none transition-colors focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20"
                  name="categoryId"
                  required
                >
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button className="w-full" size="sm" type="submit" variant="secondary">
                Redirigir
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
