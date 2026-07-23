import { LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import type { SegmentedTab } from "@/components/common/segmented-tab-list"
import { SegmentedTabList } from "@/components/common/segmented-tab-list"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { PanelCard } from "@/components/common/panel-card"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import {
  AdminPageShell,
  AdminPageTitle,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppSession } from "@/hooks/use-app-session"
import { FoodMenuCategoryDataTable } from "@/features/food-menu/food-menu-category-data-table"
import {
  getFoodMenuCategoriesByLocation,
  getFoodMenuPdfsByLocation,
} from "@/features/food-menu/food-menu.service"
import type { FoodMenuCategory, FoodMenuPdf } from "@/types/food-menu"

const FOOD_MENU_TABS = [
  { id: "categories", label: "Categories" },
  { id: "pdf", label: "PDF" },
] as const satisfies readonly SegmentedTab<FoodMenuTab>[]

type FoodMenuTab = "categories" | "pdf"

type PendingDelete =
  | { kind: "category"; id: string; label: string }
  | { kind: "pdf"; id: string; label: string }

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function FoodMenuScreen() {
  const { locationId, locationName } = useAppSession()

  const [activeTab, setActiveTab] = useState<FoodMenuTab>("categories")
  const [categoryRows, setCategoryRows] = useState<FoodMenuCategory[]>([])
  const [pdfRows, setPdfRows] = useState<FoodMenuPdf[]>([])
  const [selectedPdfId, setSelectedPdfId] = useState("")
  const [pdfDescription, setPdfDescription] = useState("")
  const [replacementPdfName, setReplacementPdfName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  const pdfOptions = useMemo(
    () =>
      pdfRows.map((row) => ({
        value: row.id,
        label: row.name,
      })),
    [pdfRows]
  )

  const selectedPdf = useMemo(
    () => pdfRows.find((row) => row.id === selectedPdfId) ?? null,
    [pdfRows, selectedPdfId]
  )

  useEffect(() => {
    if (!locationId) {
      setCategoryRows([])
      setPdfRows([])
      setSelectedPdfId("")
      setPdfDescription("")
      setReplacementPdfName("")
      setLoading(false)
      setError(null)
      setActionMessage(null)
      setPendingDelete(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setActionMessage(null)
    setCategoryRows([])
    setPdfRows([])
    setSelectedPdfId("")
    setPendingDelete(null)
    setPdfDescription("")
    setReplacementPdfName("")

    Promise.all([
      getFoodMenuCategoriesByLocation({
        locationId: locationId,
        locationLabel: locationName,
      }),
      getFoodMenuPdfsByLocation({
        locationId: locationId,
        locationLabel: locationName,
      }),
    ])
      .then(([categories, pdfs]) => {
        if (isActive) {
          setCategoryRows(categories)
          setPdfRows(pdfs)
          setSelectedPdfId(pdfs[0]?.id ?? "")
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load food menu data."
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [locationId, locationName])

  useEffect(() => {
    if (!selectedPdf) {
      setPdfDescription("")
      setReplacementPdfName("")
      return
    }

    setPdfDescription(selectedPdf.description)
    setReplacementPdfName("")
  }, [selectedPdf])

  function handleCategoryNew(row: FoodMenuCategory) {
    setActionMessage(
      `Mock action: create a new category near ${row.menuName} for ${locationName}.`
    )
  }

  function handleCategoryEdit(row: FoodMenuCategory) {
    setActionMessage(
      `Mock action: edit category ${row.menuName} for ${locationName}.`
    )
  }

  function handleCategoryDelete(row: FoodMenuCategory) {
    setPendingDelete({ kind: "category", id: row.id, label: row.menuName })
  }

  function handlePdfDelete() {
    if (!selectedPdf) {
      return
    }

    setPendingDelete({
      kind: "pdf",
      id: selectedPdf.id,
      label: selectedPdf.name,
    })
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    if (pendingDelete.kind === "category") {
      setCategoryRows((current) =>
        current.filter((row) => row.id !== pendingDelete.id)
      )
      setActionMessage(
        `Removed category ${pendingDelete.label} from ${locationName}.`
      )
    } else {
      const nextRows = pdfRows.filter((row) => row.id !== pendingDelete.id)
      setPdfRows(nextRows)
      setSelectedPdfId(nextRows[0]?.id ?? "")
      setActionMessage(
        `Removed PDF menu ${pendingDelete.label} from ${locationName}.`
      )
    }

    setPendingDelete(null)
  }

  function handlePdfAction(label: string) {
    setActionMessage(label)
  }

  return (
    <>
      <AdminPageShell>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <AdminPageTitle>Food Menu</AdminPageTitle>
            <p className="text-sm text-muted-foreground">
              Manage venue food menu categories and PDF menu assets with mock
              data until the backend integration is ready.
            </p>
          </div>
          {activeTab === "categories" ? (
            <Button
              type="button"
              disabled={!locationId || loading || categoryRows.length === 0}
              onClick={() => handleCategoryNew(categoryRows[0])}
              className="w-full sm:w-auto"
            >
              Add
            </Button>
          ) : null}
        </div>

        <PanelCard>
          <div className="flex flex-col gap-3 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span>{" "}
              Manage categories in the table, or switch to PDF for menu assets.
            </p>
            <SegmentedTabList
              tabs={FOOD_MENU_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              ariaLabel="Food menu sections"
              className="border-border bg-background/70"
            />
          </div>

          {error ? (
            <p className="border-b px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          {actionMessage ? (
            <p className="border-b px-3 py-2 text-sm text-muted-foreground">
              {actionMessage}
            </p>
          ) : null}

          {!locationId ? (
            <div className="p-4">
              <VenueNoLocationState featureLabel="Food menu data" />
            </div>
          ) : activeTab === "categories" ? (
            <FoodMenuCategoryDataTable
              data={categoryRows}
              loading={loading}
              emptyMessage="No categories found for this location."
              onEdit={handleCategoryEdit}
              onDelete={handleCategoryDelete}
            />
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading food menu data...
            </div>
          ) : pdfRows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No PDF menus found."
                description="This location does not have mock PDF menu entries yet."
              />
            </div>
          ) : (
            <div className="space-y-4 px-3 py-4">
              <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full max-w-xs space-y-1.5">
                  <Label htmlFor="food-menu-pdf-select">PDF Menu</Label>
                  <ScrollSelectControl
                    id="food-menu-pdf-select"
                    value={selectedPdfId}
                    onChange={setSelectedPdfId}
                    options={pdfOptions}
                    placeholder="Select PDF menu"
                    disabled={pdfOptions.length === 0}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedPdf}
                    onClick={() =>
                      handlePdfAction(
                        `Mock action: modify PDF menu ${selectedPdf?.name ?? ""} for ${locationName}.`
                      )
                    }
                  >
                    Modify
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePdfAction(
                        `Mock action: add a PDF menu for ${locationName}.`
                      )
                    }
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedPdf}
                    onClick={handlePdfDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedPdf}
                    onClick={() =>
                      handlePdfAction(
                        `Mock action: manage image for PDF menu ${selectedPdf?.name ?? ""} in ${locationName}.`
                      )
                    }
                  >
                    Manage Image
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-sm border border-border">
                <div className="grid lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
                  <aside className="space-y-3 border-b bg-muted/20 p-4 lg:border-b-0 lg:border-r">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Current PDF
                      </p>
                      <p className="wrap-break-word text-sm font-medium text-foreground">
                        {selectedPdf?.fileName || "Select a PDF menu"}
                      </p>
                    </div>
                    <div className="flex min-h-48 items-center justify-center rounded-sm border border-dashed border-border bg-background px-3 py-8 text-center text-sm text-muted-foreground">
                      {selectedPdf?.imageLabel ||
                        "No preview image selected yet."}
                    </div>
                    {selectedPdf ? (
                      <p className="text-xs text-muted-foreground">
                        Selected:{" "}
                        <span className="font-medium text-foreground">
                          {selectedPdf.name}
                        </span>
                      </p>
                    ) : null}
                  </aside>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="food-menu-pdf-description">
                        Description
                      </Label>
                      <Textarea
                        id="food-menu-pdf-description"
                        value={pdfDescription}
                        onChange={(event) =>
                          setPdfDescription(event.target.value)
                        }
                        placeholder="Describe the selected PDF menu"
                        className="min-h-28 resize-y"
                        disabled={!selectedPdf}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="food-menu-pdf-file">
                        Replacement PDF
                      </Label>
                      <Input
                        id="food-menu-pdf-file"
                        type="file"
                        accept="application/pdf"
                        onChange={(event) =>
                          setReplacementPdfName(
                            event.target.files?.[0]?.name || ""
                          )
                        }
                        disabled={!selectedPdf}
                        className="cursor-pointer file:mr-3 file:cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {replacementPdfName ||
                          "Choose a PDF file to replace the current document."}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!selectedPdf}
                        onClick={() =>
                          handlePdfAction(
                            `Mock action: preview ${selectedPdf?.name ?? ""} for ${locationName}.`
                          )
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        type="button"
                        disabled={!selectedPdf}
                        onClick={() =>
                          handlePdfAction(
                            `Mock action: save PDF menu changes for ${selectedPdf?.name ?? ""} in ${locationName}.`
                          )
                        }
                      >
                        Modify
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PanelCard>
      </AdminPageShell>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
          }
        }}
        onConfirm={confirmDelete}
        title={
          pendingDelete?.kind === "pdf"
            ? "Delete PDF menu?"
            : "Delete category?"
        }
        description={
          pendingDelete
            ? pendingDelete.kind === "pdf"
              ? `This will remove ${pendingDelete.label} from ${locationName}.`
              : `This will remove the ${pendingDelete.label} category from ${locationName}.`
            : ""
        }
        confirmLabel={
          pendingDelete?.kind === "pdf"
            ? "Delete PDF menu"
            : "Delete category"
        }
      />
    </>
  )
}
