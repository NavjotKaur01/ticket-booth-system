import {
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { RichTextEditor } from "@/components/common/rich-text-editor"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import CalendarDatePickerControl from "@/components/calendar/controls/CalendarDatePickerControl"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  createVenueRotatingAd,
  deleteVenueRotatingAd,
  getVenueRotatingAdsByLocation,
  updateVenueRotatingAd,
} from "@/features/venue-rotating-ads/venue-rotating-ads.service"
import { useAppSession } from "@/hooks/use-app-session"
import type { VenueRotatingAdDraft, VenueRotatingAdRecord } from "@/types/venue-rotating-ad"

const ACTIVE_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

const EMPTY_AD_FORM: VenueRotatingAdDraft = {
  alternateText: "",
  displayOrder: 1,
  active: false,
  startingDate: "",
  endingDate: "",
  adName: "",
  navigateUrl: "",
  adText: "<p></p>",
}

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

function ActivePill({ active }: { active: boolean }) {
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

function ActionButton({
  label,
  onClick,
  tone = "default",
  children,
  disabled = false,
}: {
  label: string
  onClick: () => void
  tone?: "default" | "danger"
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
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

function formatDisplayDate(value: string) {
  if (!value) {
    return "-"
  }

  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function buildEmptyAd(): VenueRotatingAdDraft {
  return { ...EMPTY_AD_FORM }
}

function recordToDraft(row: VenueRotatingAdRecord): VenueRotatingAdDraft {
  return {
    alternateText: row.alternateText,
    displayOrder: row.displayOrder,
    active: row.active,
    startingDate: row.startingDate,
    endingDate: row.endingDate,
    adName: row.adName,
    navigateUrl: row.navigateUrl,
    adText: row.adText,
  }
}

export function VenueRotatingAdsScreen() {
  const { locationId, locationName } = useAppSession()

  const [rows, setRows] = useState<VenueRotatingAdRecord[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [form, setForm] = useState<VenueRotatingAdDraft>(buildEmptyAd)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<VenueRotatingAdRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const isEditing = editingAdId != null

  const previewAd = useMemo(
    () => (rows.length > 0 ? rows[0] : null),
    [rows]
  )

  const canSubmit =
    locationId.length > 0 &&
    form.adName.trim().length > 0 &&
    form.navigateUrl.trim().length > 0 &&
    Number.isFinite(form.displayOrder)

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setDialogOpen(false)
      setPreviewOpen(false)
      setEditingAdId(null)
      setForm(buildEmptyAd())
      setLoading(false)
      setSaving(false)
      setDeletingId(null)
      setDeletingRow(null)
      setError(null)
      setStatusMessage(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    setRows([])
    setDialogOpen(false)
    setPreviewOpen(false)
    setEditingAdId(null)
    setForm(buildEmptyAd())

    getVenueRotatingAdsByLocation({
      locationId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setRows(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load rotating ads."
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

  function updateField<K extends keyof VenueRotatingAdDraft>(
    key: K,
    value: VenueRotatingAdDraft[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  function openCreateDialog() {
    setEditingAdId(null)
    setForm({
      ...buildEmptyAd(),
      displayOrder: rows.length > 0 ? Math.max(...rows.map((row) => row.displayOrder)) + 1 : 1,
    })
    setDialogOpen(true)
    setError(null)
  }

  function openEditDialog(row: VenueRotatingAdRecord) {
    setEditingAdId(row.id)
    setForm(recordToDraft(row))
    setDialogOpen(true)
    setError(null)
  }

  function handleDialogChange(open: boolean) {
    if (!open && !saving) {
      setDialogOpen(false)
      setEditingAdId(null)
      setForm(buildEmptyAd())
      setError(null)
    }
  }

  async function handleSave() {
    if (!locationId || !canSubmit || saving) {
      return
    }

    const normalizedOrder = Number(form.displayOrder)
    const payload: VenueRotatingAdDraft = {
      ...form,
      alternateText: form.alternateText.trim(),
      adName: form.adName.trim(),
      navigateUrl: form.navigateUrl.trim(),
      displayOrder: normalizedOrder,
    }

    setSaving(true)
    setError(null)
    setStatusMessage(null)

    try {
      if (isEditing && editingAdId) {
        const updatedRow = await updateVenueRotatingAd({
          locationId,
          locationLabel: locationName,
          adId: editingAdId,
          input: payload,
        })

        setRows((current) =>
          current
            .map((row) => (row.id === updatedRow.id ? updatedRow : row))
            .sort((left, right) => left.displayOrder - right.displayOrder)
        )
        setStatusMessage(`Updated rotating ad "${updatedRow.adName}" for ${locationName}.`)
      } else {
        const createdRow = await createVenueRotatingAd({
          locationId,
          locationLabel: locationName,
          input: payload,
        })

        setRows((current) =>
          [...current, createdRow].sort(
            (left, right) => left.displayOrder - right.displayOrder
          )
        )
        setStatusMessage(`Added rotating ad "${createdRow.adName}" for ${locationName}.`)
      }

      setDialogOpen(false)
      setEditingAdId(null)
      setForm(buildEmptyAd())
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the rotating ad."
      )
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!locationId || !deletingRow || deletingId) {
      return
    }

    setDeletingId(deletingRow.id)
    setError(null)

    try {
      await deleteVenueRotatingAd({
        locationId,
        locationLabel: locationName,
        adId: deletingRow.id,
      })

      setRows((current) => current.filter((row) => row.id !== deletingRow.id))
      if (editingAdId === deletingRow.id) {
        setDialogOpen(false)
        setEditingAdId(null)
        setForm(buildEmptyAd())
      }
      setStatusMessage(`Deleted rotating ad "${deletingRow.adName}" from ${locationName}.`)
      setDeletingRow(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the rotating ad."
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <TooltipProvider>
      <>
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Location Rotating Ads
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage venue rotating advertisement slots with mock service data until the
              backend integration is ready.
            </p>
          </div>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b bg-muted/40 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Location Rotating Ads Management
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    disabled={!locationId || rows.length === 0}
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="size-4" />
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    disabled={!locationId}
                    onClick={openCreateDialog}
                  >
                    <Plus className="size-4" />
                    Add New Ad
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-0 py-0">
              {error ? (
                <div className="px-4 pt-4">
                  <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                </div>
              ) : null}

              {!locationId ? (
                <div className="p-4">
                  <VenueNoLocationState featureLabel="Location rotating ads" />
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading rotating ads...
                </div>
              ) : rows.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No rotating ads found for this location."
                    description="Use Add New Ad to create the first rotating ad entry."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto px-4 py-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Alternate Text</TableHead>
                        <TableHead className="w-32">Display Order</TableHead>
                        <TableHead className="w-24">Active</TableHead>
                        <TableHead className="w-36">Starting Date</TableHead>
                        <TableHead className="w-36">Ending Date</TableHead>
                        <TableHead className="w-24 px-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium text-foreground">
                            {row.alternateText || row.adName}
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {row.displayOrder}
                          </TableCell>
                          <TableCell>
                            <ActivePill active={row.active} />
                          </TableCell>
                          <TableCell>{formatDisplayDate(row.startingDate)}</TableCell>
                          <TableCell>{formatDisplayDate(row.endingDate)}</TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center justify-end gap-1">
                              <ActionButton
                                label="Edit rotating ad"
                                onClick={() => openEditDialog(row)}
                              >
                                <Pencil className="size-4" />
                              </ActionButton>
                              <ActionButton
                                label="Delete rotating ad"
                                onClick={() => setDeletingRow(row)}
                                tone="danger"
                                disabled={deletingId === row.id}
                              >
                                {deletingId === row.id ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </ActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
              <div aria-live="polite" className="text-sm text-muted-foreground">
                {locationId
                  ? statusMessage ||
                    `${rows.length} rotating ad${rows.length === 1 ? "" : "s"} loaded for ${locationName}.`
                  : "Select a location from the header to begin managing rotating ads."}
              </div>
            </CardFooter>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="max-w-4xl p-0 sm:max-w-4xl">
            <DialogHeader className="border-b bg-muted/40 px-5 py-4">
              <DialogTitle className="text-base font-semibold text-foreground">
                Location Rotating Ads
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update the rotating ad details for ${locationName}.`
                  : `Create a new rotating ad for ${locationName}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-5">
              {error && dialogOpen ? (
                <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-display-order">Display Order</Label>
                  <Input
                    id="rotating-ad-display-order"
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(event) =>
                      updateField(
                        "displayOrder",
                        Number.parseInt(event.target.value, 10) || 0
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-active">Active</Label>
                  <Select
                    value={form.active ? "Y" : "N"}
                    onValueChange={(value) => updateField("active", value === "Y")}
                  >
                    <SelectTrigger id="rotating-ad-active" className="w-full bg-background">
                      <SelectValue placeholder="Select active state" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {ACTIVE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-name">Ad Name</Label>
                  <Input
                    id="rotating-ad-name"
                    value={form.adName}
                    onChange={(event) => updateField("adName", event.target.value)}
                    placeholder="Enter ad name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-alternate-text">Alternate Text</Label>
                  <Input
                    id="rotating-ad-alternate-text"
                    value={form.alternateText}
                    onChange={(event) => updateField("alternateText", event.target.value)}
                    placeholder="Alternate text for accessibility"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rotating-ad-url">Navigate URL</Label>
                  <Input
                    id="rotating-ad-url"
                    type="url"
                    value={form.navigateUrl}
                    onChange={(event) => updateField("navigateUrl", event.target.value)}
                    placeholder="https://example.com/promo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-start-date">Starting Date</Label>
                  <CalendarDatePickerControl
                    id="rotating-ad-start-date"
                    value={form.startingDate}
                    onChange={(value) => updateField("startingDate", value)}
                    placeholder="Select starting date"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotating-ad-end-date">Ending Date</Label>
                  <CalendarDatePickerControl
                    id="rotating-ad-end-date"
                    value={form.endingDate}
                    onChange={(value) => updateField("endingDate", value)}
                    placeholder="Select ending date"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ad Text</Label>
                <RichTextEditor
                  value={form.adText}
                  onChange={(value) => updateField("adText", value)}
                  onClear={() => updateField("adText", "<p></p>")}
                  previewLabel={form.adName || "Rotating ad preview"}
                  minHeightClassName="min-h-[16rem]"
                />
              </div>
            </div>

            <DialogFooter className="border-t px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleSave()}
                disabled={!canSubmit || saving}
              >
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isEditing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl p-0 sm:max-w-3xl">
            <DialogHeader className="border-b bg-muted/40 px-5 py-4">
              <DialogTitle className="text-base font-semibold text-foreground">
                Rotating Ad Preview
              </DialogTitle>
              <DialogDescription>
                Mock preview of the first rotating ad for {locationName}.
              </DialogDescription>
            </DialogHeader>

            {previewAd ? (
              <div className="space-y-4 px-5 py-5">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Ad Name:</span>{" "}
                    <span className="font-medium text-foreground">{previewAd.adName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Navigate URL:</span>{" "}
                    <span className="font-medium text-foreground">{previewAd.navigateUrl}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Display Order:</span>{" "}
                    <span className="font-medium text-foreground">{previewAd.displayOrder}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>{" "}
                    <ActivePill active={previewAd.active} />
                  </div>
                </div>

                <div className="rounded-md border border-border/70 bg-muted/20 p-4">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: previewAd.adText }}
                  />
                </div>
              </div>
            ) : null}

            <DialogFooter className="border-t px-5 py-4">
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteDialog
          open={Boolean(deletingRow)}
          onOpenChange={(open) => {
            if (!open && !deletingId) {
              setDeletingRow(null)
            }
          }}
          onConfirm={() => void confirmDelete()}
          title="Delete rotating ad?"
          description={deletingRow
            ? `This will remove "${deletingRow.adName || deletingRow.alternateText}" from ${locationName}.`
            : ""}
          confirmLabel="Delete rotating ad"
          isPending={Boolean(deletingId)}
        />
      </>
    </TooltipProvider>
  )
}
