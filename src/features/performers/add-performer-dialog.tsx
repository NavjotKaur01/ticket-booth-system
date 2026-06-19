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
import {
  EMPTY_PERFORMER_FORM,
  type PerformerFormValues,
} from "@/types/performer-form"

type AddPerformerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPerformerDialog({
  open,
  onOpenChange,
}: AddPerformerDialogProps) {
  const [form, setForm] = useState<PerformerFormValues>(EMPTY_PERFORMER_FORM)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_PERFORMER_FORM)
    }
  }, [open])

  function updateField<K extends keyof PerformerFormValues>(
    field: K,
    value: PerformerFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleAdd() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Add Performer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="add-performer-first-name">
              <Input
                id="add-performer-first-name"
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Last Name" htmlFor="add-performer-last-name">
              <Input
                id="add-performer-last-name"
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
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
                onChange={(event) =>
                  updateField("stageName", event.target.value)
                }
              />
            </FormField>

            <FormField label="Bio" htmlFor="add-performer-bio" className="sm:col-span-2">
              <Textarea
                id="add-performer-bio"
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className="min-h-24 resize-y"
              />
            </FormField>

            <FormField
              label="Website"
              htmlFor="add-performer-website"
              className="sm:col-span-2"
            >
              <Input
                id="add-performer-website"
                type="url"
                value={form.website}
                onChange={(event) => updateField("website", event.target.value)}
              />
            </FormField>

            <FormField label="Facebook Page" htmlFor="add-performer-facebook">
              <Input
                id="add-performer-facebook"
                value={form.facebookPage}
                onChange={(event) =>
                  updateField("facebookPage", event.target.value)
                }
              />
            </FormField>

            <FormField label="Twitter Name" htmlFor="add-performer-twitter">
              <Input
                id="add-performer-twitter"
                value={form.twitterName}
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
