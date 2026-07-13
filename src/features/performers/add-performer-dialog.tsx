import { useEffect, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { useAppSession } from "@/hooks/use-app-session"
import { saveComedian } from "@/lib/api/comedians"
import { buildSaveComedianRequest } from "@/lib/build-save-comedian-request"
import {
  EMPTY_PERFORMER_FORM,
  type PerformerFormValues,
} from "@/types/performer-form"

type AddPerformerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When true, saves via ClubMan ComedianVM → Adminstrator/SaveComedian. */
  saveViaApi?: boolean
  onSaved?: () => void | Promise<void>
}

export function AddPerformerDialog({
  open,
  onOpenChange,
  saveViaApi = false,
  onSaved,
}: AddPerformerDialogProps) {
  const { connectionName, locationId, username, isReady } = useAppSession()
  const [form, setForm] = useState<PerformerFormValues>(EMPTY_PERFORMER_FORM)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_PERFORMER_FORM)
      setError(null)
      setSaving(false)
    }
  }, [open])

  function updateField<K extends keyof PerformerFormValues>(
    field: K,
    value: PerformerFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleAdd() {
    // Comic Manager and other callers keep the previous close-only behavior.
    if (!saveViaApi) {
      onOpenChange(false)
      return
    }

    if (!form.lastName.trim() && !form.firstName.trim() && !form.stageName.trim()) {
      setError("Enter at least a last name, first name, or stage name.")
      return
    }
    if (!isReady || !connectionName || !locationId) {
      setError("Location is required before saving a comedian.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveComedian(
        buildSaveComedianRequest({
          connectionName,
          locationId,
          lastUpdateId: username,
          form,
        })
      )
      await onSaved?.()
      onOpenChange(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save comedian."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">
              {saveViaApi ? "Add Comedian" : "Add Performer"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Last Name" htmlFor="add-performer-last-name">
              <Input
                id="add-performer-last-name"
                value={form.lastName}
                disabled={saving}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </FormField>

            <FormField label="First Name" htmlFor="add-performer-first-name">
              <Input
                id="add-performer-first-name"
                value={form.firstName}
                disabled={saving}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </FormField>

            <FormField
              label="Stage Name"
              htmlFor="add-performer-stage-name"
              className="sm:col-span-2"
            >
              <Input
                id="add-performer-stage-name"
                value={form.stageName}
                disabled={saving}
                onChange={(event) =>
                  updateField("stageName", event.target.value)
                }
              />
            </FormField>

            <FormField
              label="Global Bio"
              htmlFor="add-performer-bio"
              className="sm:col-span-2"
            >
              <Textarea
                id="add-performer-bio"
                value={form.bio}
                disabled={saving}
                onChange={(event) => updateField("bio", event.target.value)}
                className="min-h-24 resize-y"
              />
            </FormField>

            <FormField
              label="URL"
              htmlFor="add-performer-website"
              className="sm:col-span-2"
            >
              <Input
                id="add-performer-website"
                type="url"
                value={form.website}
                disabled={saving}
                onChange={(event) => updateField("website", event.target.value)}
              />
            </FormField>

            <FormField label="Alt URL" htmlFor="add-performer-facebook">
              <Input
                id="add-performer-facebook"
                value={form.facebookPage}
                disabled={saving}
                onChange={(event) =>
                  updateField("facebookPage", event.target.value)
                }
              />
            </FormField>

            <FormField label="Twitter Name" htmlFor="add-performer-twitter">
              <Input
                id="add-performer-twitter"
                value={form.twitterName}
                disabled={saving}
                onChange={(event) =>
                  updateField("twitterName", event.target.value)
                }
              />
            </FormField>

            <FormField
              label="Embedded Video Code"
              htmlFor="add-performer-video-code"
              className="sm:col-span-2"
            >
              <Textarea
                id="add-performer-video-code"
                value={form.embeddedVideoCode}
                disabled={saving}
                onChange={(event) =>
                  updateField("embeddedVideoCode", event.target.value)
                }
                className="min-h-24 resize-y font-mono text-xs"
              />
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handleAdd()}
          >
            {saving ? "Saving..." : saveViaApi ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
