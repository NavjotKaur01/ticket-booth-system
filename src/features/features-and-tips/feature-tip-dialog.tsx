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
  EMPTY_FEATURE_TIP_FORM,
  type FeatureTip,
  type FeatureTipFormValues,
} from "@/types/feature-tip"

type FeatureTipDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: FeatureTip | null
  onSaved: (record: FeatureTip) => void
  onDelete?: (record: FeatureTip) => void
}

function validateForm(form: FeatureTipFormValues) {
  if (!form.header.trim()) return "Header is required."
  if (!form.description.trim()) return "Description is required."
  return null
}

function toRecord(form: FeatureTipFormValues, id: string): FeatureTip {
  return {
    id,
    header: form.header.trim(),
    navigateUrl: form.navigateUrl.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl,
    imageName: form.imageName,
  }
}

export function FeatureTipDialog({
  open,
  onOpenChange,
  record = null,
  onSaved,
  onDelete,
}: FeatureTipDialogProps) {
  const isEdit = Boolean(record)
  const [form, setForm] = useState<FeatureTipFormValues>(EMPTY_FEATURE_TIP_FORM)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FEATURE_TIP_FORM)
      setError(null)
      setPreviewUrl("")
      return
    }

    if (!record) {
      setForm(EMPTY_FEATURE_TIP_FORM)
      setPreviewUrl("")
      return
    }

    setForm({
      header: record.header,
      navigateUrl: record.navigateUrl,
      description: record.description,
      imageUrl: record.imageUrl,
      imageName: record.imageName,
    })
    setPreviewUrl(record.imageUrl)
  }, [open, record])

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function updateField<K extends keyof FeatureTipFormValues>(
    field: K,
    value: FeatureTipFormValues[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  function handleImageChange(file: File | null) {
    if (!file) {
      return
    }

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setForm((current) => ({
      ...current,
      imageUrl: objectUrl,
      imageName: file.name,
    }))
    setError(null)
  }

  function handleSave() {
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    onSaved(toRecord(form, record?.id ?? `feature-${Date.now()}`))
    onOpenChange(false)
  }

  function handleDelete() {
    if (!record || !onDelete) {
      return
    }

    onDelete(record)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[92vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-5 py-4 pr-14">
          <DialogTitle className="text-lg font-semibold leading-snug">
            Dashboard Features, Tips and Upgrades
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

          <div className="space-y-4">
            <FormField label="Header" htmlFor="feature-tip-header">
              <Textarea
                id="feature-tip-header"
                rows={2}
                value={form.header}
                onChange={(event) => updateField("header", event.target.value)}
              />
            </FormField>

            <FormField label="Navigate URL" htmlFor="feature-tip-navigate-url">
              <Textarea
                id="feature-tip-navigate-url"
                rows={2}
                value={form.navigateUrl}
                onChange={(event) => updateField("navigateUrl", event.target.value)}
              />
            </FormField>

            <FormField label="Description" htmlFor="feature-tip-description">
              <Textarea
                id="feature-tip-description"
                rows={5}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </FormField>

            <FormField label="Feature Image" htmlFor="feature-tip-image">
              <Input
                id="feature-tip-image"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageChange(event.target.files?.[0] ?? null)
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.imageName || "No file chosen"}
              </p>
            </FormField>

            <FormField label="Image Preview">
              <div className="flex min-h-28 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20 p-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={form.imageName || "Feature preview"}
                    className="max-h-40 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload an image to preview it here.
                  </p>
                )}
              </div>
            </FormField>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-5 py-3 sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            disabled={!isEdit}
            onClick={handleDelete}
          >
            Delete
          </Button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
