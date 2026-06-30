import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
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
import { getVenueInfoLocationOptions } from "@/features/venue-info/venue-info.service"
import {
  createVenueAd,
  deleteVenueAd,
  getVenueAdsByLocation,
  updateVenueAd,
  VENUE_AD_SECTION_OPTIONS,
} from "@/features/venue-ads/venue-ads.service"
import { useAppSession } from "@/hooks/use-app-session"
import type { VenueAdDraft, VenueAdRecord, VenueAdSection } from "@/types/venue-ad"

const ACTIVE_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

const EMPTY_AD_FORM: VenueAdDraft = {
  navigateUrl: "",
  displayText: "",
  active: false,
  section: "Hub",
  merchant: "",
  imageName: "",
  imagePreviewLabel: "",
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
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={tone === "danger"
        ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      }
    >
      {children}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

function buildEmptyAd() {
  return { ...EMPTY_AD_FORM }
}

export function VenueAdsScreen() {
  const { locations } = useAppSession()

  const locationOptions = useMemo(
    () =>
      getVenueInfoLocationOptions(locations).map((option) => ({
        value: option.id,
        label: option.label,
      })),
    [locations]
  )

  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [rows, setRows] = useState<VenueAdRecord[]>([])
  const [selectedAdId, setSelectedAdId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [form, setForm] = useState<VenueAdDraft>(buildEmptyAd)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingRow, setDeletingRow] = useState<VenueAdRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const selectedLocationLabel = useMemo(
    () =>
      locationOptions.find((option) => option.value === selectedLocationId)?.label ||
      "",
    [locationOptions, selectedLocationId]
  )

  const selectedAd = useMemo(
    () => rows.find((row) => row.id === selectedAdId) ?? null,
    [rows, selectedAdId]
  )

  const isEditing = editingAdId != null
  const canSubmit = selectedLocationId.length > 0 && form.navigateUrl.trim().length > 0

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  useEffect(() => {
    if (!selectedLocationId) {
      setRows([])
      setSelectedAdId("")
      setDialogOpen(false)
      setEditingAdId(null)
      setForm(buildEmptyAd())
      setImageFile(null)
      setLoading(false)
      setSaving(false)
      setDeleting(false)
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
    setSelectedAdId("")
    setDialogOpen(false)
    setEditingAdId(null)
    setForm(buildEmptyAd())
    setImageFile(null)
    setDeletingRow(null)

    getVenueAdsByLocation({
      locationId: selectedLocationId,
      locationLabel: selectedLocationLabel,
    })
      .then((result) => {
        if (!isActive) {
          return
        }

        setRows(result)
        setSelectedAdId(result[0]?.id ?? "")
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load venue ads."
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
  }, [selectedLocationId, selectedLocationLabel])

  function updateField<K extends keyof VenueAdDraft>(key: K, value: VenueAdDraft[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  function openCreateDialog() {
    setEditingAdId(null)
    setSelectedAdId("")
    setForm(buildEmptyAd())
    setImageFile(null)
    setError(null)
    setDialogOpen(true)
  }

  function openEditDialog(row: VenueAdRecord) {
    setEditingAdId(row.id)
    setSelectedAdId(row.id)
    setForm({
      navigateUrl: row.navigateUrl,
      displayText: row.displayText,
      active: row.active,
      section: row.section,
      merchant: row.merchant,
      imageName: row.imageName,
      imagePreviewLabel: row.imagePreviewLabel,
    })
    setImageFile(null)
    setError(null)
    setDialogOpen(true)
  }

  function openDeleteDialog(row: VenueAdRecord) {
    setSelectedAdId(row.id)
    setDeletingRow(row)
    setError(null)
  }

  function handleDialogChange(nextOpen: boolean) {
    setDialogOpen(nextOpen)
    if (!nextOpen) {
      setEditingAdId(null)
      setForm(buildEmptyAd())
      setImageFile(null)
      setError(null)
    }
  }

  async function handleSave() {
    if (!canSubmit || saving || deleting) {
      return
    }

    setSaving(true)
    setError(null)

    const nextForm: VenueAdDraft = {
      ...form,
      imageName: imageFile?.name || form.imageName,
      imagePreviewLabel:
        form.imagePreviewLabel.trim() ||
        form.displayText.trim() ||
        imageFile?.name ||
        form.imageName ||
        "Venue ad image preview",
    }

    try {
      if (editingAdId) {
        const updatedRow = await updateVenueAd({
          locationId: selectedLocationId,
          locationLabel: selectedLocationLabel,
          adId: editingAdId,
          input: nextForm,
        })

        setRows((current) =>
          current.map((row) => (row.id === updatedRow.id ? updatedRow : row))
        )
        setSelectedAdId(updatedRow.id)
        setStatusMessage(`Ad updated for ${selectedLocationLabel}.`)
      } else {
        const createdRow = await createVenueAd({
          locationId: selectedLocationId,
          locationLabel: selectedLocationLabel,
          input: nextForm,
        })

        setRows((current) => [createdRow, ...current])
        setSelectedAdId(createdRow.id)
        setStatusMessage(`New ad created for ${selectedLocationLabel}.`)
      }

      setDialogOpen(false)
      setEditingAdId(null)
      setForm(buildEmptyAd())
      setImageFile(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the venue ad."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedLocationId || !deletingRow || deleting || saving) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      await deleteVenueAd({
        locationId: selectedLocationId,
        locationLabel: selectedLocationLabel,
        adId: deletingRow.id,
      })

      const nextRows = rows.filter((row) => row.id !== deletingRow.id)
      setRows(nextRows)
      setSelectedAdId((current) =>
        current === deletingRow.id ? (nextRows[0]?.id ?? "") : current
      )
      setStatusMessage(`Ad removed from ${selectedLocationLabel}.`)
      setDeletingRow(null)

      if (editingAdId === deletingRow.id) {
        setDialogOpen(false)
        setEditingAdId(null)
        setForm(buildEmptyAd())
        setImageFile(null)
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the venue ad."
      )
    } finally {
      setDeleting(false)
    }
  }

  function renderPreview() {
    if (imagePreviewUrl) {
      return (
        <img
          src={imagePreviewUrl}
          alt={form.displayText || "Venue ad preview"}
          className="h-full w-full rounded-md object-cover"
        />
      )
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
        <ImageIcon className="size-8" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {form.imageName || "No image selected"}
          </p>
          <p>{form.imagePreviewLabel || "Upload an ad image to preview it here."}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Venue Ads
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage venue advertisement links and creative metadata with mock service
            data until the backend endpoints are ready.
          </p>
        </div>

        <Card className="gap-0 py-0">
          <CardContent className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,18rem)_auto_1fr] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="venue-ads-location">Location</Label>
              <ScrollSelectControl
                id="venue-ads-location"
                value={selectedLocationId}
                onChange={setSelectedLocationId}
                options={locationOptions}
                placeholder="Select location"
                disabled={locationOptions.length === 0}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              className="gap-2 lg:self-end"
              disabled={!selectedLocationId}
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              New
            </Button>

            <div className="rounded-sm border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Click a row to open the editor dialog. The table stays clean, while the
              form keeps the same data shape we can later swap to the real API.
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Venue Ads Management
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-0 py-0">
            {error ? (
              <div className="px-4 pt-4">
                <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              </div>
            ) : null}

            {!selectedLocationId ? (
              <div className="p-4">
                <EmptyState
                  title="Select a location to manage venue ads."
                  description="The ad table and editor will load after you choose a location."
                />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading venue ads...
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No ads found for this location."
                  description="Use New to create the first venue ad entry for this location."
                />
              </div>
            ) : (
              <div className="w-full">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-24 px-4">Selected</TableHead>
                      <TableHead className="w-[58%]">Navigate URL</TableHead>
                      <TableHead className="w-52">Display Text</TableHead>
                      <TableHead className="w-28">Active</TableHead>
                      <TableHead className="w-36 px-4">Section</TableHead>
                      <TableHead className="w-24 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const isSelected = row.id === selectedAdId

                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => openEditDialog(row)}
                          className={isSelected
                            ? "cursor-pointer bg-primary/10 hover:bg-primary/10"
                            : "cursor-pointer"
                          }
                        >
                          <TableCell className="px-4">
                            <button
                              type="button"
                              aria-label={isSelected ? "Selected venue ad" : "Select venue ad"}
                              className="inline-flex items-center justify-center rounded-full text-primary"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedAdId(row.id)
                              }}
                            >
                              {isSelected ? (
                                <CheckCircle2 className="size-5" />
                              ) : (
                                <Circle className="size-5 text-muted-foreground" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="max-w-0">
                            <div className="flex min-w-0 items-start gap-2">
                              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                              <span className="block truncate text-sm text-foreground" title={row.navigateUrl}>{row.navigateUrl}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.displayText || "-"}
                          </TableCell>
                          <TableCell>
                            <StatusPill active={row.active} />
                          </TableCell>
                          <TableCell className="px-4">
                            <span className="font-medium text-foreground">{row.section}</span>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center justify-end gap-1">
                              <ActionIconButton
                                label="Edit ad"
                                onClick={() => openEditDialog(row)}
                              >
                                <Pencil className="size-4" />
                              </ActionIconButton>
                              <ActionIconButton
                                label="Delete ad"
                                onClick={() => openDeleteDialog(row)}
                                tone="danger"
                              >
                                <Trash2 className="size-4" />
                              </ActionIconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {selectedLocationId
                ? statusMessage ||
                  `${rows.length} mock ad${rows.length === 1 ? "" : "s"} loaded for ${selectedLocationLabel}. Click a row to edit it or use New to add another.`
                : "Choose a location to begin managing venue ads."}
            </div>
            {selectedAd ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="text-foreground">Selected:</span>
                <span className="max-w-48 truncate">{selectedAd.displayText || selectedAd.navigateUrl}</span>
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl p-0 sm:max-w-4xl">
          <DialogHeader className="border-b bg-muted/40 px-5 py-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              Location Ads
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the selected ad details for ${selectedLocationLabel}.`
                : `Create a new ad entry for ${selectedLocationLabel}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue-ad-url">Navigate URL</Label>
                <Input
                  id="venue-ad-url"
                  type="url"
                  value={form.navigateUrl}
                  onChange={(event) => updateField("navigateUrl", event.target.value)}
                  placeholder="https://example.com/promo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-ad-display-text">Display Text</Label>
                <Input
                  id="venue-ad-display-text"
                  value={form.displayText}
                  onChange={(event) => updateField("displayText", event.target.value)}
                  placeholder="Shown when the image is unavailable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-ad-merchant">Merchant</Label>
                <Input
                  id="venue-ad-merchant"
                  value={form.merchant}
                  onChange={(event) => updateField("merchant", event.target.value)}
                  placeholder="Merchant or sponsor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-ad-active">Active</Label>
                <Select
                  value={form.active ? "Y" : "N"}
                  onValueChange={(value) => updateField("active", value === "Y")}
                >
                  <SelectTrigger id="venue-ad-active" className="w-full bg-background">
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
                <Label htmlFor="venue-ad-section">Section</Label>
                <Select
                  value={form.section}
                  onValueChange={(value) => updateField("section", value as VenueAdSection)}
                >
                  <SelectTrigger id="venue-ad-section" className="w-full bg-background">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72" position="popper">
                    {VENUE_AD_SECTION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue-ad-image-label">Image Preview Label</Label>
                <Input
                  id="venue-ad-image-label"
                  value={form.imagePreviewLabel}
                  onChange={(event) => updateField("imagePreviewLabel", event.target.value)}
                  placeholder="Preview helper text or creative label"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="venue-ad-image">Ad Image</Label>
                <Input
                  id="venue-ad-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  {imageFile?.name || form.imageName || "Upload an image to preview it here."}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Image Preview</Label>
              <div className="aspect-[16/6] overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                {renderPreview()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={!isEditing || saving}
              onClick={() => {
                if (selectedAd) {
                  setDeletingRow(selectedAd)
                }
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleSave()}
                disabled={!canSubmit || saving || deleting}
              >
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deletingRow)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingRow(null)
          }
        }}
        onConfirm={() => void handleDelete()}
        title="Delete venue ad?"
        description={deletingRow
          ? `This will remove ${deletingRow.displayText || deletingRow.navigateUrl} from ${selectedLocationLabel}.`
          : ""}
        confirmLabel="Delete ad"
        isPending={deleting}
      />
    </>
  )
}




