import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

interface InfiniteScrollTableProps<T> {
  query: ReturnType<typeof useInfiniteQuery<T[]>>;
  columns: Array<{
    header: string;
    accessor: (row: T) => ReactNode;
  }>;
  onRowClick?: (row: T) => void;
}

export function InfiniteScrollTable<T extends { id: string }>({
  query,
  columns,
  onRowClick,
}: InfiniteScrollTableProps<T>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    query;
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rows = data?.pages.flatMap((page) => page) ?? [];

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: "hsl(var(--border))" }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b hover:bg-secondary/50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              style={{ borderColor: "hsl(var(--border))" }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-4 py-3 text-sm text-foreground">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasNextPage && <div ref={observerTarget} className="h-4" />}
      {isFetchingNextPage && (
        <div className="text-center py-4 text-muted-foreground">
          Loading more...
        </div>
      )}
    </div>
  );
}
