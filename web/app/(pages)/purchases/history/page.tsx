import { ListFilter, LoaderCircle } from "lucide-react";
import { PurchaseStatus } from "@/types/models/purchase";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import { lazy, Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
const PurchaseList = lazy(
  () => import("@/components/purchases/history/PurchaseList")
);
type FilterOption = "all" | PurchaseStatus;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Completadas" },
];

export default async function PurchaseHistory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const activeFilter = (params.status as FilterOption) || "all";

  return (
    <MaxWidthWrapper className="py-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListFilter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar por estado</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Link
                replace={true}
                key={option.value}
                href={
                  option.value === "all"
                    ? "/purchases/history"
                    : `/purchases/history?status=${option.value}`
                }
              >
                <p
                  className={`text-base font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-200 ${
                    activeFilter === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <ErrorWrapper>
          <Suspense
            key={Object.values(params).join("")}
            fallback={
              <div className="min-h-[70svh] grid place-content-center ">
                <LoaderCircle size={30} className=" animate-spin" />
              </div>
            }
          >
            <PurchaseList searchParams={params} />
          </Suspense>
        </ErrorWrapper>
      </div>
    </MaxWidthWrapper>
  );
}
