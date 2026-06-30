import {
  FileImage,
  FilePlus2,
  FileText,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import type { SegmentedTab } from "@/components/common/segmented-tab-list"
import { SegmentedTabList } from "@/components/common/segmented-tab-list"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppSession } from "@/hooks/use-app-session"
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

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={active
        ? "inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        : "inline-flex min-w-9 items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Y" : "N"}
    </span>
  )
}

function ActionIconButton({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string
  onClick: () => void
  tone?: "default" | "danger"
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          className={tone === "danger"
            ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

function PdfToolbarButton({
  label,
  onClick,
  icon,
  disabled = false,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClick}
          disabled={disabled}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
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
      return
    }

    setPdfDescription(selectedPdf.description)
  }, [selectedPdf])

  function handleCategoryNew(row: FoodMenuCategory) {
    setActionMessage(`Mock action: create a new category near ${row.menuName} for ${locationName}.`)
  }

  function handleCategoryEdit(row: FoodMenuCategory) {
    setActionMessage(`Mock action: edit category ${row.menuName} for ${locationName}.`)
  }

  function handleCategoryDelete(row: FoodMenuCategory) {
    setPendingDelete({ kind: "category", id: row.id, label: row.menuName })
  }

  function handlePdfDelete() {
    if (!selectedPdf) {
      return
    }

    setPendingDelete({ kind: "pdf", id: selectedPdf.id, label: selectedPdf.name })
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    if (pendingDelete.kind === "category") {
      setCategoryRows((current) => current.filter((row) => row.id !== pendingDelete.id))
      setActionMessage(`Removed category ${pendingDelete.label} from ${locationName}.`)
    } else {
      const nextRows = pdfRows.filter((row) => row.id !== pendingDelete.id)
      setPdfRows(nextRows)
      if (selectedPdfId === pendingDelete.id) {
        setSelectedPdfId(nextRows[0]?.id ?? "")
      }
      setActionMessage(`Removed PDF menu ${pendingDelete.label} from ${locationName}.`)
    }

    setPendingDelete(null)
  }

  function handlePdfAction(label: string) {
    setActionMessage(label)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Food Menu
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage venue food menu categories and PDF menu assets with mock data until
            the backend integration is ready.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Food Menu Data
              </CardTitle>
              <SegmentedTabList
                tabs={FOOD_MENU_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                ariaLabel="Food menu sections"
                className="border-border bg-background/70"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-4 py-5">
            {error ? (
              <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {!locationId ? (
              <VenueNoLocationState featureLabel="Food menu data" />
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading food menu data...
              </div>
            ) : activeTab === "categories" ? (
              categoryRows.length === 0 ? (
                <EmptyState
                  title="No categories found."
                  description="This location does not have mock food menu categories yet."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14 px-4">#</TableHead>
                      <TableHead>Menu Name</TableHead>
                      <TableHead>Menu Order</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{row.menuName}</TableCell>
                        <TableCell className="tabular-nums">{row.menuOrder}</TableCell>
                        <TableCell><StatusPill active={row.active} /></TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-1">
                            <ActionIconButton
                              label="New category"
                              onClick={() => handleCategoryNew(row)}
                            >
                              <Plus className="size-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Edit category"
                              onClick={() => handleCategoryEdit(row)}
                            >
                              <Pencil className="size-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Delete category"
                              onClick={() => handleCategoryDelete(row)}
                              tone="danger"
                            >
                              <Trash2 className="size-4" />
                            </ActionIconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="food-menu-pdf-select">PDF Menus</Label>
                    <ScrollSelectControl
                      id="food-menu-pdf-select"
                      value={selectedPdfId}
                      onChange={setSelectedPdfId}
                      options={pdfOptions}
                      placeholder="Select PDF menu"
                      disabled={pdfOptions.length === 0}
                    />
                  </div>

                                    <div className="flex flex-wrap items-center justify-start gap-1 rounded-sm border border-border/70 bg-muted/20 px-2 py-1 lg:justify-end">
                    <PdfToolbarButton
                      label="Modify PDF menu"
                      icon={<Pencil className="size-4" />}
                      onClick={() =>
                        handlePdfAction(`Mock action: modify PDF menu ${selectedPdf?.name ?? ""} for ${locationName}.`)
                      }
                      disabled={!selectedPdf}
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Add PDF menu"
                      icon={<FilePlus2 className="size-4" />}
                      onClick={() =>
                        handlePdfAction(`Mock action: add a PDF menu for ${locationName}.`)
                      }
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Delete PDF menu"
                      icon={<Trash2 className="size-4" />}
                      onClick={handlePdfDelete}
                      disabled={!selectedPdf}
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Add image for PDF"
                      icon={<FileImage className="size-4" />}
                      onClick={() =>
                        handlePdfAction(`Mock action: manage image for PDF menu ${selectedPdf?.name ?? ""} in ${locationName}.`)
                      }
                      disabled={!selectedPdf}
                    />
                  </div>
                </div>

                {pdfRows.length === 0 ? (
                  <EmptyState
                    title="No PDF menus found."
                    description="This location does not have mock PDF menu entries yet."
                  />
                ) : (
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_1fr]">
                    <Card className="gap-0 border border-border/80 py-0 shadow-none">
                      <CardContent className="space-y-3 px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Current PDF</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedPdf?.fileName || "Select a PDF menu to inspect its details."}
                          </p>
                        </div>

                        <div className="rounded-sm border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                          {selectedPdf?.imageLabel || "No preview image selected yet."}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="gap-0 border border-border/80 py-0 shadow-none">
                      <CardContent className="grid gap-4 px-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="food-menu-pdf-description">Description</Label>
                            <Textarea
                              id="food-menu-pdf-description"
                              value={pdfDescription}
                              onChange={(event) => setPdfDescription(event.target.value)}
                              placeholder="Describe the selected PDF menu"
                              className="min-h-24"
                              disabled={!selectedPdf}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="food-menu-pdf-file">Replacement PDF</Label>
                            <Input
                              id="food-menu-pdf-file"
                              type="file"
                              accept="application/pdf"
                              onChange={(event) =>
                                setReplacementPdfName(event.target.files?.[0]?.name || "")
                              }
                              disabled={!selectedPdf}
                            />
                            <p className="text-xs text-muted-foreground">
                              {replacementPdfName || "Choose a PDF file to replace the current document."}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="gap-1.5"
                            disabled={!selectedPdf}
                            onClick={() =>
                              handlePdfAction(`Mock action: preview ${selectedPdf?.name ?? ""} for ${locationName}.`)
                            }
                          >
                            <Eye className="size-4" />
                            Preview
                          </Button>
                          <Button
                            type="button"
                            className="gap-1.5"
                            disabled={!selectedPdf}
                            onClick={() =>
                              handlePdfAction(`Mock action: save PDF menu changes for ${selectedPdf?.name ?? ""} in ${locationName}.`)
                            }
                          >
                            <FileText className="size-4" />
                            Modify
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t px-4 py-3">
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {locationId
                ? actionMessage || `Food menu mock data loaded for ${locationName}.`
                : "Select a location from the header to begin managing the food menu."}
            </div>
          </CardFooter>
        </Card>
        <ConfirmDeleteDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) {
              setPendingDelete(null)
            }
          }}
          onConfirm={confirmDelete}
          title={pendingDelete?.kind === "pdf" ? "Delete PDF menu?" : "Delete category?"}
          description={pendingDelete
            ? pendingDelete.kind === "pdf"
              ? `This will remove ${pendingDelete.label} from ${locationName}.`
              : `This will remove the ${pendingDelete.label} category from ${locationName}.`
            : ""}
          confirmLabel={pendingDelete?.kind === "pdf" ? "Delete PDF menu" : "Delete category"}
        />
      </div>
    </TooltipProvider>
  )
}



