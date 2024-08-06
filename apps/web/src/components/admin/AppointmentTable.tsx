import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RankingInfo } from "@tanstack/match-sorter-utils";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  RowSelectionState,
  SortingFn,
  SortingState,
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  // getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import dayjs from "dayjs";
import {
  ArrowUpDown,
  ChevronDown,
  // MoreHorizontal
} from "lucide-react";
import type { ClassNames } from "react-day-picker";
import { useForm } from "react-hook-form";
import { FaCalendarAlt, FaPrescription, FaRegEdit } from "react-icons/fa";
import { MdOutlineHistory } from "react-icons/md";
import { RiSearchLine } from "react-icons/ri";
import { z } from "zod";

// import { Filter as SingleColumnFilter } from "~/components/admin/common/Filter";
// import { DebouncedInput as GlobalSearchInput } from "~/components/admin/common/DebouncedInput";
import { Button } from "~/components/ui/button";
// import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/utils";
import { useUser } from "~/utils/auth";
import type { Appointment } from "~/utils/store/admin";
import { Calendar } from "../ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";

// import { Filter } from "../common/Filter";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<Appointment> = (
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

const fuzzySort: SortingFn<Appointment> = (rowA, rowB, columnId) => {
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

const dateSortingFn: SortingFn<Appointment> = (rowA, rowB) => {
  const a = new Date(rowA.getValue("date")).getTime();
  const b = new Date(rowB.getValue("date")).getTime();
  return a - b;
};

const dateFilter: FilterFn<Appointment> = (
  row,
  columnId,
  value: [string, string],
  // addMeta,
) => {
  // // Rank the item
  // const itemRank = rankItem(row.getValue(columnId), value[0]);

  // ! Need to add rank info later. Read docs for details
  // // Store the itemRank info
  // addMeta({
  //   itemRank,
  // });

  const currentDateStr = row.getValue(columnId);
  const currentDate = dayjs(currentDateStr as string);
  const isAfterMinDate =
    currentDate.isAfter(dayjs(value[0]).startOf("day")) ||
    currentDate.isSame(dayjs(value[0]).startOf("day"));
  const isBeforeMaxDate =
    currentDate.isBefore(dayjs(value[1]).endOf("day")) ||
    currentDate.isSame(dayjs(value[1]).endOf("day"));

  // Return if the item should be filtered in/out
  // return itemRank.passed;
  return isAfterMinDate && isBeforeMaxDate;
};

interface Pagination {
  pageSize: number;
  pageIndex: number;
}

interface Props {
  appointments: Appointment[];
  onPaginationChange: Dispatch<SetStateAction<Pagination>>;
  pagination: Pagination;
  isLoading: boolean;
  pageCount: number;
}

export const AppointmentTable = (props: Props) => {
  const [user] = useUser();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: true,
    },
  ]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    index: true,
    doctorId: false,
    doctorName: false,
    patientId: false,
    patientName: true,
    patientPhone: true,
    fee: false,
    location: false,
    serialNo: true,
    type: false,
    status: false,
    purpose: false,
    date: true,
    history: true,
    time: false,
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    0: false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const today = startOfDay(new Date());

  const columns = useMemo<ColumnDef<Appointment, string>[]>(
    () => [
      /** checkbox feature for later use.
       * ! DO NOT DELETE */
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={
      //         table.getIsAllPageRowsSelected() ||
      //         (table.getIsSomePageRowsSelected() && "indeterminate")
      //       }
      //       onCheckedChange={(value) =>
      //         table.toggleAllPageRowsSelected(!!value)
      //       }
      //       aria-label="Select all"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={row.getIsSelected()}
      //       onCheckedChange={(value) => row.toggleSelected(!!value)}
      //       aria-label="Select row"
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
      {
        accessorKey: "index",
        header: () => "Index",
        cell: (info) => info.row.index + 1,
        // keep this cell hidden by default
        enableHiding: false,
      },
      {
        accessorKey: "doctorId",
        header: () => "Doctor Id",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "doctorName",
        header: () => "Doctor Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "patientId",
        header: () => "Patient Id",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "patientName",
        header: () => "Patient Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "patientPhone",
        header: () => "Phone No",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "serialNo",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Serial No
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-center lg:pl-5 lg:text-start">
            {row.getValue("serialNo")}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: () => "Type",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "status",
        header: () => "Status",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "purpose",
        header: () => "Purpose",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "fee",
        header: () => "Fee",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: (info) => <div>{new Date(info.getValue()).toDateString()}</div>,
        sortingFn: dateSortingFn,
        enableSorting: true,
        filterFn: dateFilter,
      },
      {
        accessorKey: "time",
        header: () => "Time",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "location",
        header: () => "Location",
        cell: (info) => info.getValue(),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "history",
        header: () => "History",
        cell: ({ row }) => {
          return (
            <div className="ml-4 w-fit">
              {!!user && user.role === "DOCTOR" && (
                <Link href={`/med-records/${row.original.patientId}`}>
                  <MdOutlineHistory className="text-lg" />
                </Link>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => "Actions",
        cell: ({ row }) => {
          return (
            <div>
              {!!user && user.role === "DOCTOR" && (
                <div className="flex gap-4">
                  <Button
                    className="disabled:text-muted-foreground h-fit w-fit bg-transparent p-0 text-black"
                    disabled={dayjs(row.original.date).isBefore(today)}
                  >
                    <Link href={`/admin/prescription/${row.original.id}`}>
                      <FaPrescription className="text-lg" />
                    </Link>
                  </Button>
                  <Button
                    className="disabled:text-muted-foreground h-fit w-fit bg-transparent p-0 text-black"
                    disabled={dayjs(row.original.date).isBefore(today)}
                  >
                    <Link href={`/admin/appointment/${row.original.id}`}>
                      <FaRegEdit className="text-lg" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: props.appointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),

    // start pagination
    // getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: props.onPaginationChange,
    manualPagination: true,
    // end pagination

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount: props.pageCount,
    state: {
      pagination: props.pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
      // dateFilter: dateFilter,
    },
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: false,
  });

  // const sortedUniqueDoctorNames = useMemo(() => {
  //   const doctorNameColumn = table
  //     .getAllColumns()
  //     .find((column) => column.id === "doctorName");

  //   const uniqueSortedKeys = doctorNameColumn?.getFacetedUniqueValues().keys();
  //   const uniqueSortedKeysArray = uniqueSortedKeys
  //     ? Array.from<string>(uniqueSortedKeys).sort()
  //     : [];

  //   return {
  //     doctorNameColumn,
  //     uniqueSortedKeysArray,
  //   };
  // }, [table]);

  const dateColumn = table.getColumn("date");

  const currentPageStartNo = table.getState().pagination.pageIndex * 10 + 1;
  const currentPageEndNo =
    table.getState().pagination.pageIndex * 10 +
    table.getState().pagination.pageSize;

  return (
    <main className="w-full">
      <div className="mt-2 w-full gap-2 lg:flex lg:items-center lg:gap-4">
        <h2 className="font-semibold">Filter by Date</h2>
        {!!dateColumn && <DateFilter column={dateColumn} table={table} />}
      </div>
      <div className="flex items-center py-4">
        {/* <GlobalSearchInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="font-lg border-block mt-4 w-3/5 rounded-[10px] border px-4 py-3 shadow outline-none lg:mt-0 lg:w-1/3 lg:px-5 lg:py-4"
          placeholder="Search All Columns..."
        /> */}{" "}
        <Label className="bg-muted flex max-w-sm items-center rounded-md py-2.5 pl-2 lg:w-1/4">
          <RiSearchLine className="ml-1 h-4 w-4 fill-[#0099FF] lg:fill-[#84818A]" />
          <Input
            placeholder="Find Patients..."
            value={
              (table.getColumn("patientName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("patientName")?.setFilterValue(event.target.value)
            }
            className="ml-1 w-full bg-transparent"
          />
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* WORKING CODE START */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {props.isLoading ? (
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((singleDigit) => (
                <TableRow key={singleDigit}>
                  <TableCell colSpan={columns?.length} className="text-start">
                    <TableSkeleton />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      {/* WORKING CODE END */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        {/* <div className="text-muted-foreground flex-1 text-sm">
          {"Showing " +
            (table.getState().pagination.pageIndex * 10 + 1) +
            " to " +
            Math.min(
              (table.getState().pagination.pageIndex + 1) * 10,
              table.getPrePaginationRowModel().rows.length,
            ) +
            " "}
          of {table.getPrePaginationRowModel().rows.length} row(s).
        </div> */}

        <div className="text-muted-foreground flex-1 text-sm">
          {`Showing ${currentPageStartNo} to ${currentPageEndNo} of many row(s).`}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="disabled:bg-muted disabled:text-muted-foreground"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="disabled:bg-muted disabled:text-muted-foreground"
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
};

// DateFilter
export function DateFilter<TData, TValue = unknown>({
  column,
  table,
}: {
  column: Column<TData, TValue>;
  table: TanstackTable<TData>;
}) {
  const DateFilterSchema = z.object({
    date: z.object({ from: z.date(), to: z.date() }),
  });

  type DateFilterSchemaType = z.infer<typeof DateFilterSchema>;

  const form = useForm<DateFilterSchemaType>({
    resolver: zodResolver(DateFilterSchema),
  });
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

  const onSubmit = (value: DateFilterSchemaType) => {
    column.setFilterValue([value.date.from, value.date.to]);
  };

  const classNames: ClassNames = {
    day_selected: `aria-selected:bg-[#0099FF] text-white focus:bg-[#0099FF] focus:text-white`,
  };

  const resetTable = () => {
    form.reset();
    setFrom(undefined);
    setTo(undefined);
    table.resetColumnFilters();
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-2 flex items-center gap-2"
        >
          <FormField
            control={form.control}
            name="date.from"
            render={({ field }) => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMM yyyy")
                        ) : (
                          <span>From</span>
                        )}
                        {!field.value && (
                          <FaCalendarAlt className="ml-4 h-4 w-4 opacity-80" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        setFrom(date);
                        field.onChange(date);
                      }}
                      classNames={classNames}
                      disabled={(date) => {
                        if (!to) {
                          return false;
                        }
                        return isAfter(date, startOfDay(to));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <span>-</span>

          <FormField
            control={form.control}
            name="date.to"
            render={({ field }) => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMM yyyy")
                        ) : (
                          <span>To</span>
                        )}
                        {!field.value && (
                          <FaCalendarAlt className="ml-4 h-4 w-4 opacity-80" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        setTo(date);
                        field.onChange(date);
                      }}
                      classNames={classNames}
                      disabled={(date) => {
                        if (!from) {
                          return false;
                        }
                        return isBefore(date, startOfDay(from));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="bg-[#0099FF] font-bold leading-[30px]"
          >
            Filter
          </Button>
          <Button
            type="button"
            className="bg-[#ff0000] font-bold leading-[30px]"
            onClick={() => resetTable()}
          >
            Reset
          </Button>
        </form>
      </Form>
    </>
  );
}

export const TableSkeleton = () => {
  return (
    <div className="flex justify-between">
      <Skeleton className="h-[20px] w-[100px] rounded" />
      <Skeleton className="h-[20px] w-[100px] rounded" />
      <Skeleton className="h-[20px] w-[50px] rounded" />
      <Skeleton className="h-[20px] w-[100px] rounded" />
      <Skeleton className="h-[20px] w-[50px] rounded" />
      <div className="flex w-[120px] justify-between">
        <Skeleton className="h-[20px] w-[50px] rounded" />
        <Skeleton className="h-[20px] w-[50px] rounded" />
      </div>
    </div>
  );
};
