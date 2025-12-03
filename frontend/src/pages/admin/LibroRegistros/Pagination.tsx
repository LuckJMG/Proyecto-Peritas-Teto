import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (setter: (p: number) => number) => void;
}

export function Pagination({ page, totalPages, setPage }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "ghost"}
            size="sm"
            onClick={() => setPage(() => p)}
            className={page === p ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600"}
          >
            {p}
          </Button>
        ))}
        {totalPages > 10 && <span className="px-2 text-gray-400">...</span>}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
