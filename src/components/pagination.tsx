import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Pagination({
  currentPage,
  totalPages,
  getHref,
  label,
}: {
  currentPage: number;
  totalPages: number;
  getHref: (page: number) => string;
  label: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <Button asChild={currentPage > 1} disabled={currentPage <= 1} variant="secondary">
        {currentPage > 1 ? (
          <Link href={getHref(currentPage - 1)}>
            <ChevronLeft aria-hidden="true" size={16} />
            Anterior
          </Link>
        ) : (
          <span>
            <ChevronLeft aria-hidden="true" size={16} />
            Anterior
          </span>
        )}
      </Button>

      <span className="text-sm text-stone-400">
        Pagina {currentPage} de {totalPages}
      </span>

      <Button asChild={currentPage < totalPages} disabled={currentPage >= totalPages} variant="secondary">
        {currentPage < totalPages ? (
          <Link href={getHref(currentPage + 1)}>
            Siguiente
            <ChevronRight aria-hidden="true" size={16} />
          </Link>
        ) : (
          <span>
            Siguiente
            <ChevronRight aria-hidden="true" size={16} />
          </span>
        )}
      </Button>
    </nav>
  );
}
