import { User } from "lucide-react"
import { useEffect, useState } from "react"

import { FormField, FormSection } from "@/components/forms/form-fields"
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
import { getComicInfo, type ComicInfo } from "@/data/comedian-info"

const PREFERRED_CONTACT_OPTIONS = [
  { value: "home", label: "Home Phone" },
  { value: "mobile", label: "Mobile Phone" },
  { value: "fax", label: "Fax" },
  { value: "agent", label: "Agent" },
  { value: "email", label: "Email" },
] as const

const COMPACT_INPUT = "h-8 text-xs"
const COMPACT_SELECT = "h-8 w-full text-xs"

type ComicInfoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageName: string
}

export function ComicInfoDialog({
  open,
  onOpenChange,
  stageName,
}: ComicInfoDialogProps) {
  const [form, setForm] = useState<ComicInfo>(() => getComicInfo(stageName))

  useEffect(() => {
    if (open) {
      setForm(getComicInfo(stageName))
    }
  }, [open, stageName])

  function updateField<K extends keyof ComicInfo>(
    field: K,
    value: ComicInfo[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested
        showCloseButton
        className="flex max-h-[92vh] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden sm:max-w-none"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-2.5 pr-12">
          <DialogTitle className="text-base font-semibold text-foreground">
            Edit Comedian
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-2 lg:w-36">
              <div className="flex size-28 items-center justify-center rounded-md border border-border/60 bg-muted/30">
                <User className="size-16 text-muted-foreground/60" />
              </div>
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs">
                Change Image
              </Button>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <FormSection title="Comedian Info">
                <div className="grid gap-2 sm:grid-cols-2">
                  <FormField label="Last Name" htmlFor="comic-last-name">
                    <Input
                      id="comic-last-name"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className={COMPACT_INPUT}
                    />
                  </FormField>
                  <FormField label="First Name" htmlFor="comic-first-name">
                    <Input
                      id="comic-first-name"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className={COMPACT_INPUT}
                    />
                  </FormField>
                  <FormField
                    label="Stage Name"
                    htmlFor="comic-stage-name"
                    className="sm:col-span-2"
                  >
                    <Input
                      id="comic-stage-name"
                      value={form.stageName}
                      onChange={(e) => updateField("stageName", e.target.value)}
                      className={COMPACT_INPUT}
                    />
                  </FormField>
                  <FormField
                    label="About comedian"
                    htmlFor="comic-about"
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="comic-about"
                      value={form.about}
                      onChange={(e) => updateField("about", e.target.value)}
                      className="min-h-20 resize-y text-xs"
                    />
                  </FormField>
                </div>
              </FormSection>
            </div>
          </div>

          <FormSection title="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="min-h-16 resize-y text-xs"
            />
          </FormSection>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="space-y-2">
              <FormField label="Email" htmlFor="comic-email">
                <Input
                  id="comic-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Address" htmlFor="comic-address">
                <Input
                  id="comic-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Home Phone" htmlFor="comic-home-phone">
                <Input
                  id="comic-home-phone"
                  value={form.homePhone}
                  onChange={(e) => updateField("homePhone", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Zip Code" htmlFor="comic-zip">
                <Input
                  id="comic-zip"
                  value={form.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Country">
                <Select
                  value={form.country || "select"}
                  onValueChange={(value) =>
                    updateField("country", value === "select" ? "" : value)
                  }
                >
                  <SelectTrigger className={COMPACT_SELECT}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select country</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="space-y-2">
              <FormField label="URL" htmlFor="comic-url">
                <Input
                  id="comic-url"
                  value={form.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Address2" htmlFor="comic-address2">
                <Input
                  id="comic-address2"
                  value={form.address2}
                  onChange={(e) => updateField("address2", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Mobile Phone" htmlFor="comic-mobile-phone">
                <Input
                  id="comic-mobile-phone"
                  value={form.mobilePhone}
                  onChange={(e) => updateField("mobilePhone", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="State">
                <Select
                  value={form.state || "select"}
                  onValueChange={(value) =>
                    updateField("state", value === "select" ? "" : value)
                  }
                >
                  <SelectTrigger className={COMPACT_SELECT}>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select State</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Preferred Contact">
                <RadioGroup
                  value={form.preferredContact}
                  onValueChange={(value) => updateField("preferredContact", value)}
                  className="flex w-auto flex-row flex-wrap items-center gap-x-3 gap-y-1"
                >
                  {PREFERRED_CONTACT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-1.5 text-xs"
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

            <div className="space-y-2">
              <FormField label="AltURL" htmlFor="comic-alt-url">
                <Textarea
                  id="comic-alt-url"
                  value={form.altUrl}
                  onChange={(e) => updateField("altUrl", e.target.value)}
                  className="min-h-16 resize-y font-mono text-xs"
                />
              </FormField>
              <FormField label="City" htmlFor="comic-city">
                <Input
                  id="comic-city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Fax" htmlFor="comic-fax">
                <Input
                  id="comic-fax"
                  value={form.fax}
                  onChange={(e) => updateField("fax", e.target.value)}
                  className={COMPACT_INPUT}
                />
              </FormField>
              <FormField label="Artist Type">
                <Select
                  value={form.artistType || "select"}
                  onValueChange={(value) =>
                    updateField("artistType", value === "select" ? "" : value)
                  }
                >
                  <SelectTrigger className={COMPACT_SELECT}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Select type</SelectItem>
                    <SelectItem value="Comedian">Comedian</SelectItem>
                    <SelectItem value="Host">Host</SelectItem>
                    <SelectItem value="Musician">Musician</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-4 py-2.5 sm:justify-start">
          <Button type="button" size="sm" onClick={handleSave}>
            Save
          </Button>
          <span className="hidden text-xs text-muted-foreground sm:inline">or</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
