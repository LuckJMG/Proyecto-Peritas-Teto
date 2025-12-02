interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (setter: (p: number) => number) => void;
}

export function Pagination({ page, totalPages, setPage }: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-sm">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1 disabled:text-gray-300 hover:text-gray-900"
      >
        ‹ Anterior
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(() => p)}
          className={`px-3 py-1 rounded ${
            page === p
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      {totalPages > 10 && <span className="px-2">...</span>}

      <button
        disabled={page === totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        className="px-3 py-1 disabled:text-gray-300 hover:text-gray-900"
      >
        Siguiente ›
      </button>
    </div>
  );
}