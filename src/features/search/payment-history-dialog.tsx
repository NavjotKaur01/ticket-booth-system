import { FileDown, Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PanelCard } from "@/components/common/panel-card"
import { DataTable } from "@/components/data-table/data-table"
import {
  FILTER_SELECT_CLASS,
  FormField,
  FormSection,
  IconActionButton,
} from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { paymentHistoryRecords } from "@/data/payment-history"
import { paymentHistoryColumns } from "@/features/search/payment-history-columns"
import { filterPaymentHistoryRecords } from "@/lib/filter-payment-history"
import {
  DEFAULT_PAYMENT_HISTORY_FILTERS,
  PAYMENT_HISTORY_SEARCH_BY_OPTIONS,
  type PaymentHistoryFilters,
  type PaymentHistorySearchBy,
} from "@/types/payment-history"

type PaymentHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
}: PaymentHistoryDialogProps) {
  const [draftFilters, setDraftFilters] = useState(
    DEFAULT_PAYMENT_HISTORY_FILTERS
  )
  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_PAYMENT_HISTORY_FILTERS
  )
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!open) {
      setDraftFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
      setAppliedFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
      setSearched(false)
      return
    }

    setDraftFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
    setAppliedFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
    setSearched(true)
  }, [open])

  const results = useMemo(
    () =>
      filterPaymentHistoryRecords(
        paymentHistoryRecords,
        appliedFilters,
        searched
      ),
    [appliedFilters, searched]
  )

  function updateDraftField<K extends keyof PaymentHistoryFilters>(
    field: K,
    value: PaymentHistoryFilters[K]
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSearch() {
    setAppliedFilters(draftFilters)
    setSearched(true)
  }

  function handleClear() {
    setDraftFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
    setAppliedFilters(DEFAULT_PAYMENT_HISTORY_FILTERS)
    setSearched(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-4xl flex-col overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <div className="flex items-center justify-between gap-3 pr-2">
            <DialogTitle className="text-lg leading-snug font-normal">
              <span className="font-semibold text-foreground">
                Payment History
              </span>
            </DialogTitle>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileDown className="size-3.5" />
              Export
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <PanelCard>
            <FormSection title="Search Criteria" className="space-y-1.5 border-b p-3">
              <div className="flex flex-wrap items-end gap-2">
                <FormField
                  label="Search By"
                  htmlFor="payment-search-by"
                  className="w-full sm:w-44"
                >
                  <Select
                    value={draftFilters.searchBy}
                    onValueChange={(value) =>
                      updateDraftField(
                        "searchBy",
                        value as PaymentHistorySearchBy
                      )
                    }
                  >
                    <SelectTrigger
                      id="payment-search-by"
                      className={FILTER_SELECT_CLASS}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_HISTORY_SEARCH_BY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label={
                    PAYMENT_HISTORY_SEARCH_BY_OPTIONS.find(
                      (option) => option.value === draftFilters.searchBy
                    )?.label ?? "Search Value"
                  }
                  htmlFor="payment-search-value"
                  className="w-full sm:w-48"
                >
                  <Input
                    id="payment-search-value"
                    value={draftFilters.searchValue}
                    onChange={(event) =>
                      updateDraftField("searchValue", event.target.value)
                    }
                    className="h-9"
                  />
                </FormField>

                <div className="flex shrink-0 items-center gap-1.5">
                  <IconActionButton
                    label="Search"
                    icon={Search}
                    variant="default"
                    onClick={handleSearch}
                  />
                  <IconActionButton label="Clear" icon={X} onClick={handleClear} />
                </div>
              </div>
            </FormSection>

            <DataTable
              columns={paymentHistoryColumns}
              data={results}
              emptyMessage="No record found"
              entityLabel="records"
            />
          </PanelCard>
        </div>
      </DialogContent>
    </Dialog>
  )
}
