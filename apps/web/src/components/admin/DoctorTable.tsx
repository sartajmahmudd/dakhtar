import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { RankingInfo } from "@tanstack/match-sorter-utils";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingFn,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";

import { DebouncedInput } from "~/components/admin/common/DebouncedInput";
import { Filter } from "~/components/admin/common/Filter";
import type { AdminDoctor } from "~/utils/store/admin";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<AdminDoctor> = (
  row,
  columnId,
  value: string,
  addMeta,
) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fuzzySort: SortingFn<AdminDoctor> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (
    rowA.columnFiltersMeta?.columnId?.itemRank &&
    rowB.columnFiltersMeta?.columnId?.itemRank
  ) {
    dir = compareItems(
      rowA.columnFiltersMeta.columnId.itemRank,
      rowB.columnFiltersMeta.columnId.itemRank,
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

interface Props {
  doctors: AdminDoctor[];
}

export const DoctorTable = (props: Props) => {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<AdminDoctor, string>[]>(
    () => [
      {
        accessorKey: "index",
        header: () => "Index",
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "name",
        header: () => "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "onboarding",
        header: () => "Onboarding Status",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "verified",
        header: () => "Verified",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "slug",
        header: () => "Slug",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: () => "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "phone",
        header: () => "Phone",
        cell: (info) => info.getValue(),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: props.doctors,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: false,
  });

  return (
    <main>
      <section>
        <div className="mx-[20px] overflow-x-auto p-2 lg:mx-[90px]">
          <div>
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="font-lg border-block my-2 w-full border p-2 shadow"
              placeholder="Search All Columns..."
            />
          </div>
          <div className="h-2" />
          <table className="table-pin-rows table-xs mt-4 table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  className="text-[0.85rem] font-bold text-slate-800"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <>
                            <button
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </button>
                            {header.column.getCanFilter() ? (
                              <div>
                                <Filter
                                  key={header.id}
                                  column={header.column}
                                  table={table}
                                />
                              </div>
                            ) : null}
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className="hover:cursor-pointer hover:bg-gray-400"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          className="relative bg-white bg-opacity-20 px-6 py-4"
                          key={cell.id}
                          onClick={() => {
                            void router.push(
                              `/admin/doctor/${row.original.id}`,
                              undefined,
                              { shallow: true },
                            );
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="h-2" />
          <div className="flex items-center gap-2">
            <button
              className="rounded border p-1"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="w-16 rounded border p-1"
              />
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="rounded-md bg-[#f7f7f7] px-[14px] py-[10px]"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
        </div>
      </section>
    </main>
  );
};
