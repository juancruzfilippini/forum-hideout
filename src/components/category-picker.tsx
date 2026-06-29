"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

const categoryStyles: Record<string, string> = {
  anuncios: "border-lime-300/70 bg-lime-300/10 text-lime-200 hover:bg-lime-300/20",
  general: "border-cyan-300/50 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20",
  soporte: "border-amber-300/60 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20",
  sugerencias: "border-fuchsia-300/50 bg-fuchsia-300/10 text-fuchsia-100 hover:bg-fuchsia-300/20",
};

export function CategoryPicker({ categories }: { categories: CategoryOption[] }) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium text-stone-300">Categoria</legend>
      <input name="categoryId" type="hidden" value={selectedId} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const selected = category.id === selectedId;

          return (
            <button
              aria-pressed={selected}
              className={cn(
                "relative h-12 rounded-md border px-3 text-left text-sm font-bold uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300",
                categoryStyles[category.slug] ??
                  "border-stone-700 bg-stone-900 text-stone-100 hover:border-stone-500",
                selected
                  ? "border-lime-300 bg-lime-300 text-stone-950 shadow-[0_0_22px_rgba(190,255,64,0.18)]"
                  : "",
              )}
              key={category.id}
              onClick={() => setSelectedId(category.id)}
              type="button"
            >
              {selected ? (
                <Check aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2" size={16} />
              ) : null}
              {category.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
