import { Camera, Trash2, User } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import { FormField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  mapComedianInfoToUpdateForm,
  mapPerformerToUpdateForm,
  mapUpdateFormToComicInfo,
} from "@/lib/map-performer-form"
import { cn } from "@/lib/utils"
import {
  useGetComedianInfoQuery,
  useUpdateComedianMutation,
} from "@/store/api/clubmanApi"
import type { ApiComedianInfo } from "@/types/api/comedian-info"
import type { Performer } from "@/types/performer"
import {
  EMPTY_UPDATE_PERFORMER_FORM,
  type UpdatePerformerFormValues,
} from "@/types/performer-form"

const FIELD_GRID_3 = "grid gap-3 sm:grid-cols-3"
const BANNER_UPLOAD_GRID = "grid gap-3 sm:grid-cols-2"
const GLOBAL_BIO_MAX_LENGTH = 500

const TAB_PANEL_HEIGHT_CLASS =
  "h-[min(20rem,calc(92vh-15rem))] shrink-0 overflow-y-auto"

const FILE_INPUT_CLASS =
  "min-w-0 flex-1 cursor-pointer file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"

const PERFORMER_TABS = [
  { id: "basic" as const, label: "Basic Info" },
  { id: "local" as const, label: "Local Info" },
  { id: "global" as const, label: "Global Info" },
  { id: "banner" as const, label: "Banner" },
]

type PerformerTab = (typeof PERFORMER_TABS)[number]["id"]

type UpdatePerformerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  performer: Performer | null
  onSaved?: () => void | Promise<void>
}

function PerformerTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: PerformerTab
  onTabChange: (tab: PerformerTab) => void
}) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div
        role="tablist"
        aria-label="Performer form sections"
        className="inline-flex w-max max-w-full flex-nowrap rounded-sm border border-border bg-muted/30 p-0.5"
      >
        {PERFORMER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`performer-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`performer-panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
              activeTab === tab.id
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PerformerPictureSection({
  pictureLabel,
  uploadId,
  fileName,
  onFileNameChange,
}: {
  pictureLabel: string
  uploadId: string
  fileName: string
  onFileNameChange: (fileName: string) => void
}) {
  function handleRemove() {
    onFileNameChange("")
    const input = document.getElementById(uploadId)
    if (input instanceof HTMLInputElement) {
      input.value = ""
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{pictureLabel}</h3>

      <div className="grid gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
        <div className="flex aspect-square w-full max-w-30 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/15">
          <div className="flex flex-col items-center gap-1.5 px-2 text-center text-muted-foreground">
            <Camera className="size-7 opacity-45" aria-hidden />
            <span className="text-xs leading-snug">No image uploaded</span>
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Input
              id={uploadId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={FILE_INPUT_CLASS}
              onChange={(event) => {
                const file = event.target.files?.[0]
                onFileNameChange(file?.name ?? "")
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={!fileName}
              aria-label="Remove image"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG or PNG • Max size 5MB
          </p>
        </div>
      </div>
    </section>
  )
}

function PerformerBioSection({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <section className="space-y-3 border-t border-border/60 pt-4">
      <Label
        htmlFor="update-performer-global-bio"
        className="text-sm font-semibold text-foreground"
      >
        Global Bio
      </Label>

      <div className="relative">
        <Textarea
          id="update-performer-global-bio"
          value={value}
          onChange={(event) =>
            onChange(event.target.value.slice(0, GLOBAL_BIO_MAX_LENGTH))
          }
          placeholder="Write a short bio about the comedian..."
          maxLength={GLOBAL_BIO_MAX_LENGTH}
          className="min-h-20 resize-y pb-8"
        />
        <span className="pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums text-muted-foreground">
          {value.length}/{GLOBAL_BIO_MAX_LENGTH}
        </span>
      </div>
    </section>
  )
}

function ResizePictureButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("shrink-0 whitespace-nowrap", className)}
    >
      Resize
    </Button>
  )
}

function FileUploadWithResizeField({
  id,
  label,
  fileName,
  onFileNameChange,
}: {
  id: string
  label: string
  fileName: string
  onFileNameChange: (fileName: string) => void
}) {
  return (
    <FormField label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="file"
          accept="image/*"
          className={FILE_INPUT_CLASS}
          onChange={(event) => {
            const file = event.target.files?.[0]
            onFileNameChange(file?.name ?? "")
          }}
        />
        <ResizePictureButton />
      </div>
      {fileName ? (
        <p className="mt-1 truncate text-xs text-muted-foreground">{fileName}</p>
      ) : null}
    </FormField>
  )
}

function BasicInfoTab({
  form,
  updateField,
}: {
  form: UpdatePerformerFormValues
  updateField: <K extends keyof UpdatePerformerFormValues>(
    field: K,
    value: UpdatePerformerFormValues[K]
  ) => void
}) {
  return (
    <div className="space-y-3">
      <div className={FIELD_GRID_3}>
        <FormField label="First Name" htmlFor="update-performer-first-name">
          <Input
            id="update-performer-first-name"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
        </FormField>

        <FormField label="Last Name" htmlFor="update-performer-last-name">
          <Input
            id="update-performer-last-name"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </FormField>

        <FormField label="Stage Name" htmlFor="update-performer-stage-name">
          <Input
            id="update-performer-stage-name"
            value={form.stageName}
            onChange={(event) => updateField("stageName", event.target.value)}
          />
        </FormField>

        <FormField label="Website" htmlFor="update-performer-website">
          <Input
            id="update-performer-website"
            type="url"
            value={form.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </FormField>

        <FormField label="Facebook Page" htmlFor="update-performer-facebook">
          <Input
            id="update-performer-facebook"
            value={form.facebookPage}
            onChange={(event) =>
              updateField("facebookPage", event.target.value)
            }
          />
        </FormField>

        <FormField label="Twitter Name" htmlFor="update-performer-twitter">
          <Input
            id="update-performer-twitter"
            value={form.twitterName}
            onChange={(event) => updateField("twitterName", event.target.value)}
          />
        </FormField>

        <FormField
          label="Embedded Video Code"
          htmlFor="update-performer-video-code"
          className="sm:col-span-3"
        >
          <Textarea
            id="update-performer-video-code"
            value={form.embeddedVideoCode}
            onChange={(event) =>
              updateField("embeddedVideoCode", event.target.value)
            }
            className="min-h-24 resize-y font-mono text-xs"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <Checkbox
            id="update-performer-use-global-picture"
            checked={form.useGlobalPicture}
            onCheckedChange={(checked) =>
              updateField("useGlobalPicture", checked === true)
            }
          />
          <Label
            htmlFor="update-performer-use-global-picture"
            className="cursor-pointer text-sm font-normal"
          >
            Use Global Picture
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="update-performer-use-global-bio"
            checked={form.useGlobalBio}
            onCheckedChange={(checked) =>
              updateField("useGlobalBio", checked === true)
            }
          />
          <Label
            htmlFor="update-performer-use-global-bio"
            className="cursor-pointer text-sm font-normal"
          >
            Use Global Bio
          </Label>
        </div>
      </div>
    </div>
  )
}

function LocalInfoTab({
  form,
  updateField,
}: {
  form: UpdatePerformerFormValues
  updateField: <K extends keyof UpdatePerformerFormValues>(
    field: K,
    value: UpdatePerformerFormValues[K]
  ) => void
}) {
  return (
    <PerformerPictureSection
      pictureLabel="Local Picture"
      uploadId="update-performer-local-image"
      fileName={form.localImageFileName}
      onFileNameChange={(fileName) =>
        updateField("localImageFileName", fileName)
      }
    />
  )
}

function GlobalInfoTab({
  form,
  updateField,
}: {
  form: UpdatePerformerFormValues
  updateField: <K extends keyof UpdatePerformerFormValues>(
    field: K,
    value: UpdatePerformerFormValues[K]
  ) => void
}) {
  return (
    <div className="space-y-4">
      <PerformerPictureSection
        pictureLabel="Global Picture"
        uploadId="update-performer-global-image"
        fileName={form.globalImageFileName}
        onFileNameChange={(fileName) =>
          updateField("globalImageFileName", fileName)
        }
      />

      <PerformerBioSection
        value={form.globalBio}
        onChange={(value) => updateField("globalBio", value)}
      />
    </div>
  )
}

function BannerTab({
  form,
  updateField,
}: {
  form: UpdatePerformerFormValues
  updateField: <K extends keyof UpdatePerformerFormValues>(
    field: K,
    value: UpdatePerformerFormValues[K]
  ) => void
}) {
  return (
    <div className={BANNER_UPLOAD_GRID}>
      <FileUploadWithResizeField
        id="update-performer-comic-slider"
        label="Comic Slider Pic"
        fileName={form.comicSliderPicFileName}
        onFileNameChange={(fileName) =>
          updateField("comicSliderPicFileName", fileName)
        }
      />

      <FileUploadWithResizeField
        id="update-performer-comic-banner"
        label="Comic Banner Pic"
        fileName={form.comicBannerPicFileName}
        onFileNameChange={(fileName) =>
          updateField("comicBannerPicFileName", fileName)
        }
      />
    </div>
  )
}

function TabPanel({
  id,
  activeTab,
  tabId,
  children,
}: {
  id: string
  activeTab: PerformerTab
  tabId: PerformerTab
  children: ReactNode
}) {
  if (activeTab !== tabId) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={`performer-tab-${tabId}`}
      className="h-full"
    >
      {children}
    </div>
  )
}

export function UpdatePerformerDialog({
  open,
  onOpenChange,
  performer,
  onSaved,
}: UpdatePerformerDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [activeTab, setActiveTab] = useState<PerformerTab>("basic")
  const [form, setForm] = useState<UpdatePerformerFormValues>(
    EMPTY_UPDATE_PERFORMER_FORM
  )
  const [details, setDetails] = useState<ApiComedianInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    data: comedianInfo,
    isLoading: loadingDetails,
    isFetching: fetchingDetails,
    error: detailsError,
  } = useGetComedianInfoQuery(
    { connectionName, comicId: performer?.id ?? "" },
    { skip: !open || !performer?.id || !connectionName }
  )

  const [updateComedian] = useUpdateComedianMutation()

  useEffect(() => {
    if (!open) {
      setActiveTab("basic")
      setForm(EMPTY_UPDATE_PERFORMER_FORM)
      setDetails(null)
      setError(null)
      setSaving(false)
      return
    }

    if (comedianInfo) {
      setDetails(comedianInfo)
      setForm(mapComedianInfoToUpdateForm(comedianInfo))
      setActiveTab("basic")
      return
    }

    if (performer) {
      setForm(mapPerformerToUpdateForm(performer))
      setActiveTab("basic")
    }
  }, [open, performer, comedianInfo])

  function updateField<K extends keyof UpdatePerformerFormValues>(
    field: K,
    value: UpdatePerformerFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleUpdate() {
    if (!performer) return
    if (!isReady || !connectionName || !locationId) {
      reportErrorMessage(setError, "Location is required before updating a comedian.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateComedian({
        connectionName,
        locationId,
        username,
        comicId: performer.id,
        form: mapUpdateFormToComicInfo(form, details),
      }).unwrap()
      toastSuccess("Comedian updated")
      await onSaved?.()
      onOpenChange(false)
    } catch (saveError) {
      reportError(setError, saveError, "Failed to update comedian")
    } finally {
      setSaving(false)
    }
  }

  const formDisabled = saving || loadingDetails || fetchingDetails
  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ") ||
    form.stageName ||
    "Performer"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              Update Comedian
            </span>
            {performer ? (
              <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                {displayName}
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
          {detailsError ? (
            <p className="mb-2 text-sm text-destructive">
              Unable to load comedian details.
            </p>
          ) : null}
          {error ? <p className="mb-2 text-sm text-destructive">{error}</p> : null}
          {loadingDetails || fetchingDetails ? (
            <p className="mb-2 text-sm text-muted-foreground">
              Loading comedian details...
            </p>
          ) : null}

          <div className="shrink-0 space-y-3 pb-3">
            <PerformerTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 p-3 sm:hidden">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
                <User className="size-6 text-muted-foreground/55" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                {form.stageName ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {form.stageName}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className={cn(TAB_PANEL_HEIGHT_CLASS, "mt-1")}>
            <TabPanel
              id="performer-panel-basic"
              activeTab={activeTab}
              tabId="basic"
            >
              <BasicInfoTab form={form} updateField={updateField} />
            </TabPanel>

            <TabPanel
              id="performer-panel-local"
              activeTab={activeTab}
              tabId="local"
            >
              <LocalInfoTab form={form} updateField={updateField} />
            </TabPanel>

            <TabPanel
              id="performer-panel-global"
              activeTab={activeTab}
              tabId="global"
            >
              <GlobalInfoTab form={form} updateField={updateField} />
            </TabPanel>

            <TabPanel
              id="performer-panel-banner"
              activeTab={activeTab}
              tabId="banner"
            >
              <BannerTab form={form} updateField={updateField} />
            </TabPanel>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-auto"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-auto"
            disabled={formDisabled}
            onClick={() => void handleUpdate()}
          >
            {saving ? "Saving..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
