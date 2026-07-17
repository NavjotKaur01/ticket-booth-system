import { User } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useState, useRef } from "react"

import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { getComicInfo, type ComicInfo } from "@/data/comedian-info"
import { reportError, toastSuccess } from "@/lib/app-toast"
import { cn } from "@/lib/utils"

const PREFERRED_CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "mobile", label: "Mobile Phone" },
  { value: "home", label: "Home Phone" },
  { value: "fax", label: "Fax" },
  { value: "agent", label: "Agent" },
] as const

const FIELD_GRID_2 = "grid gap-3 sm:grid-cols-2"
const FIELD_GRID_3 = "grid gap-3 sm:grid-cols-3"
const SECTION_PANEL = "rounded-lg border border-border/60 bg-muted/10 p-4"

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
]

const STATE_OPTIONS = [
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "MA", label: "Massachusetts" },
]

const ARTIST_TYPE_OPTIONS = [
  { value: "Comedian", label: "Comedian" },
  { value: "Host", label: "Host" },
  { value: "Musician", label: "Musician" },
]

const COMIC_TABS = [
  { id: "info" as const, label: "Comedian Info" },
  { id: "contact" as const, label: "Contact & Address" },
]

type ComicInfoTab = (typeof COMIC_TABS)[number]["id"]

type ComicInfoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAfterClose?: () => void
  stageName?: string
  comic?: ComicInfo | null
  nested?: boolean
  isLoading?: boolean
  /** Desktop Edit Comedian = single page; tabs used elsewhere. */
  layout?: "tabs" | "flat"
  title?: string
  onSave?: (values: ComicInfo) => void | Promise<void>
  onChangeImage?: (base64Image: string) => void | Promise<void>
  onDeleteImage?: () => void | Promise<void>
}

type UpdateField = <K extends keyof ComicInfo>(
  field: K,
  value: ComicInfo[K]
) => void

function SkeletonField({
  labelWidth = "w-20",
  className,
}: {
  labelWidth?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Skeleton className={`mb-1 h-3.5 ${labelWidth}`} />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}

function ComicInfoDialogBodySkeleton() {
  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
      aria-label="Loading edit comic form"
    >
      <div className="space-y-4">
        <div className="inline-flex rounded-sm border border-border bg-muted/30 p-0.5">
          <Skeleton className="h-8 w-28 rounded-sm" />
          <Skeleton className="ml-0.5 h-8 w-32 rounded-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start">
          <div className="flex flex-col items-center gap-2 text-center">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
          <div className="min-w-0 space-y-4">
            <div className={SECTION_PANEL}>
              <div className={FIELD_GRID_3}>
                <SkeletonField />
                <SkeletonField />
                <SkeletonField />
              </div>
            </div>
            <div className={SECTION_PANEL}>
              <Skeleton className="mb-3 h-9 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className={SECTION_PANEL}>{children}</div>
    </section>
  )
}

function ComicInfoTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ComicInfoTab
  onTabChange: (tab: ComicInfoTab) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Comedian form sections"
      className="inline-flex rounded-sm border border-border bg-muted/30 p-0.5"
    >
      {COMIC_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`comic-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`comic-panel-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function ComicProfileCard({
  form,
  onChangeImage,
  onDeleteImage,
}: {
  form: ComicInfo
  onChangeImage?: (base64Image: string) => void | Promise<void>
  onDeleteImage?: () => void | Promise<void>
}) {
  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") || form.stageName

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      // Extract just the base64 part
      const base64 = dataUrl.split(",")[1]
      if (base64 && onChangeImage) {
        onChangeImage(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 self-start text-center sm:sticky sm:top-0">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background shadow-xs">
        {form.imageUrl ? (
          <img src={form.imageUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <User className="size-11 text-muted-foreground/55" aria-hidden />
        )}
      </div>
      <div className="space-y-0.5 px-1">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground">
          {form.stageName !== displayName ? `${form.stageName} · ` : ""}
          {form.artistType || "Comedian"}
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />
      <div className="flex flex-col gap-1 w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={!onChangeImage}
        >
          Change image
        </Button>
        {form.imageUrl && onDeleteImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDeleteImage}
          >
            Remove image
          </Button>
        )}
      </div>
    </div>
  )
}

function ComedianInfoPanel({
  form,
  updateField,
  onChangeImage,
  onDeleteImage,
}: {
  form: ComicInfo
  updateField: UpdateField
  onChangeImage?: (base64Image: string) => void | Promise<void>
  onDeleteImage?: () => void | Promise<void>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start">
      <ComicProfileCard form={form} onChangeImage={onChangeImage} onDeleteImage={onDeleteImage} />

      <div className="min-w-0 space-y-4">
        <FormSection title="Identity">
          <div className={FIELD_GRID_3}>
            <FormField label="Last Name" htmlFor="comic-last-name">
              <Input
                id="comic-last-name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                autoComplete="family-name"
              />
            </FormField>
            <FormField label="First Name" htmlFor="comic-first-name">
              <Input
                id="comic-first-name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                autoComplete="given-name"
              />
            </FormField>
            <FormField label="Stage Name" htmlFor="comic-stage-name">
              <Input
                id="comic-stage-name"
                value={form.stageName}
                onChange={(e) => updateField("stageName", e.target.value)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Biography">
          <div className="space-y-3">
            <FormField label="About comedian" htmlFor="comic-about">
              <Textarea
                id="comic-about"
                value={form.about}
                onChange={(e) => updateField("about", e.target.value)}
                placeholder="Short bio shown on listings and marketing materials"
                className="min-h-24 resize-y"
              />
            </FormField>
            <FormField label="Notes" htmlFor="comic-notes">
              <Textarea
                id="comic-notes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Staff notes"
                className="min-h-16 resize-y"
              />
            </FormField>
          </div>
        </FormSection>
      </div>
    </div>
  )
}

function ContactAddressPanel({
  form,
  updateField,
}: {
  form: ComicInfo
  updateField: UpdateField
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <FormSection title="Contact Information">
          <div className="space-y-3">
            <div className={FIELD_GRID_2}>
              <FormField label="Email" htmlFor="comic-email">
                <Input
                  id="comic-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Website" htmlFor="comic-url">
                <Input
                  id="comic-url"
                  type="url"
                  value={form.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  placeholder="https://"
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_2}>
              <FormField label="Alt website" htmlFor="comic-alt-url">
                <Input
                  id="comic-alt-url"
                  type="url"
                  value={form.altUrl}
                  onChange={(e) => updateField("altUrl", e.target.value)}
                  placeholder="https://"
                />
              </FormField>

              <FormField label="Artist type">
                <Select
                  value={form.artistType || "select"}
                  onValueChange={(value) =>
                    updateField("artistType", value === "select" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select type</SelectItem>
                    {ARTIST_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Preferred contact">
                <RadioGroup
                  value={form.preferredContact}
                  onValueChange={(value) =>
                    updateField("preferredContact", value)
                  }
                  className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border/60 bg-background px-3 py-2.5"
                >
                  {PREFERRED_CONTACT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-1.5 text-sm"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`comic-contact-${option.value}`}
                      />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormField>
          </div>
        </FormSection>

        <FormSection title="Address">
          <div className="space-y-3">
            <div className={FIELD_GRID_2}>
              <FormField label="Address line 1" htmlFor="comic-address">
                <Input
                  id="comic-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  autoComplete="address-line1"
                />
              </FormField>
              <FormField label="Address line 2" htmlFor="comic-address2">
                <Input
                  id="comic-address2"
                  value={form.address2}
                  onChange={(e) => updateField("address2", e.target.value)}
                  autoComplete="address-line2"
                  placeholder="Suite, unit, etc."
                />
              </FormField>
            </div>

            <div className={FIELD_GRID_3}>
              <FormField label="City" htmlFor="comic-city">
                <Input
                  id="comic-city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  autoComplete="address-level2"
                />
              </FormField>
              <FormField label="State">
                <Select
                  value={form.state || "select"}
                  onValueChange={(value) =>
                    updateField("state", value === "select" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select state</SelectItem>
                    {STATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Zip code" htmlFor="comic-zip">
                <Input
                  id="comic-zip"
                  value={form.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  autoComplete="postal-code"
                />
              </FormField>
            </div>

            <FormField label="Country">
              <Select
                value={form.country || "select"}
                onValueChange={(value) =>
                  updateField("country", value === "select" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select country</SelectItem>
                  {COUNTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>
      </div>

      <FormSection title="Phone numbers">
        <div className={FIELD_GRID_3}>
          <FormField label="Mobile phone" htmlFor="comic-mobile-phone">
            <Input
              id="comic-mobile-phone"
              type="tel"
              value={form.mobilePhone}
              onChange={(e) => updateField("mobilePhone", e.target.value)}
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Home phone" htmlFor="comic-home-phone">
            <Input
              id="comic-home-phone"
              type="tel"
              value={form.homePhone}
              onChange={(e) => updateField("homePhone", e.target.value)}
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Fax" htmlFor="comic-fax">
            <Input
              id="comic-fax"
              type="tel"
              value={form.fax}
              onChange={(e) => updateField("fax", e.target.value)}
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  )
}

export function ComicInfoDialog({
  open,
  onOpenChange,
  onAfterClose,
  stageName,
  comic,
  nested = false,
  isLoading = false,
  layout = "tabs",
  title,
  onSave,
  onChangeImage,
  onDeleteImage,
}: ComicInfoDialogProps) {
  const [form, setForm] = useState<ComicInfo>(() => comic ?? getComicInfo(stageName ?? ""))
  const [activeTab, setActiveTab] = useState<ComicInfoTab>("info")
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setHasInitialized(false)
      setSaveError(null)
      return
    }

    if (open && !isLoading && !hasInitialized) {
      setForm(comic ?? getComicInfo(stageName ?? ""))
      setActiveTab("info")
      setHasInitialized(true)
    }
  }, [isLoading, open, comic, stageName, hasInitialized])

  // If the image is updated by the API while the modal is open, we sync just the image to the local form state
  // to avoid overwriting other edits the user may have in progress.
  useEffect(() => {
    if (hasInitialized && comic?.imageUrl !== form.imageUrl) {
      setForm((current) => ({ ...current, imageUrl: comic?.imageUrl }))
    }
  }, [comic?.imageUrl, hasInitialized, form.imageUrl])

  function updateField<K extends keyof ComicInfo>(
    field: K,
    value: ComicInfo[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!onSave) {
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave(form)
      toastSuccess("Comedian saved")
      onOpenChange(false)
    } catch (error) {
      reportError(setSaveError, error, "Failed to save comedian")
    } finally {
      setIsSaving(false)
    }
  }

  const dialogTitle = title ?? (onSave ? "Edit Comedian" : "Show Comedian")

  function resetDialogSession() {
    setForm(getComicInfo(""))
    setActiveTab("info")
    setHasInitialized(false)
    onAfterClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested={nested}
        disableOutsideDismiss={nested}
        showCloseButton
        onAfterClose={resetDialogSession}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-5 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <ComicInfoDialogBodySkeleton />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {layout === "tabs" ? (
                <>
                  <ComicInfoTabs activeTab={activeTab} onTabChange={setActiveTab} />

                  <div
                    role="tabpanel"
                    id={`comic-panel-${activeTab}`}
                    aria-labelledby={`comic-tab-${activeTab}`}
                  >
                    {activeTab === "info" ? (
                      <ComedianInfoPanel
                        form={form}
                        updateField={updateField}
                        onChangeImage={onChangeImage}
                        onDeleteImage={onDeleteImage}
                      />
                    ) : (
                      <ContactAddressPanel form={form} updateField={updateField} />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <ComedianInfoPanel
                    form={form}
                    updateField={updateField}
                    onChangeImage={onChangeImage}
                    onDeleteImage={onDeleteImage}
                  />
                  <ContactAddressPanel form={form} updateField={updateField} />
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="shrink-0 border-t bg-muted/15 px-5 py-3 sm:justify-between">
          {saveError ? (
            <p className="text-sm text-destructive">{saveError}</p>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isSaving}
            >
              Cancel
            </Button>
            {onSave ? (
              <Button
                type="button"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => void handleSave()}
                disabled={isLoading || isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
