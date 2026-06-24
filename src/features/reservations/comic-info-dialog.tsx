import { User } from "lucide-react"
import { useEffect, useState } from "react"

import CalendarSelectControl from "@/components/calendar/controls/CalendarSelectControl"
import { FormField, FormSection } from "@/components/forms/form-fields"
import { PhoneStringInputGroup } from "@/components/forms/phone-input-group"
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
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
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

type ComicInfoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageName: string
  nested?: boolean
  isLoading?: boolean
  onSave?: (values: ComicInfo) => void | Promise<void>
}

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
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  )
}

function SkeletonPhoneField({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div>
      <Skeleton className={`mb-1 h-3.5 ${labelWidth}`} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
      </div>
    </div>
  )
}

function ComicInfoDialogBodySkeleton() {
  return (
    <div className="space-y-4 overflow-y-auto px-4 py-3" aria-label="Loading edit comic form">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2 lg:w-36">
          <Skeleton className="size-28 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <section className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <div className="grid gap-2 sm:grid-cols-2">
              <SkeletonField labelWidth="w-16" />
              <SkeletonField labelWidth="w-16" />
              <SkeletonField labelWidth="w-20" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <Skeleton className="mb-1 h-3.5 w-28" />
                <Skeleton className="min-h-20 w-full rounded-md" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-2">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="min-h-16 w-full rounded-md" />
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-2">
          <SkeletonField labelWidth="w-10" />
          <SkeletonField labelWidth="w-14" />
          <SkeletonPhoneField labelWidth="w-20" />
          <SkeletonField labelWidth="w-16" />
          <SkeletonField labelWidth="w-14" />
        </div>

        <div className="space-y-2">
          <SkeletonField labelWidth="w-8" />
          <SkeletonField labelWidth="w-16" />
          <SkeletonPhoneField labelWidth="w-24" />
          <SkeletonField labelWidth="w-10" />
        </div>

        <div className="space-y-2">
          <SkeletonField labelWidth="w-12" />
          <SkeletonField labelWidth="w-8" />
          <SkeletonPhoneField labelWidth="w-8" />
          <SkeletonField labelWidth="w-16" />
        </div>
      </div>

      <div>
        <Skeleton className="mb-1 h-3.5 w-28" />
        <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ComicInfoDialog({
  open,
  onOpenChange,
  stageName,
  nested = false,
  isLoading = false,
  onSave,
}: ComicInfoDialogProps) {
  const [form, setForm] = useState<ComicInfo>(() => getComicInfo(stageName))

  useEffect(() => {
    if (open && !isLoading) {
      setForm(getComicInfo(stageName))
    }
  }, [isLoading, open, stageName])

  function updateField<K extends keyof ComicInfo>(
    field: K,
    value: ComicInfo[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    await onSave?.(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        nested={nested}
        disableOutsideDismiss
        showCloseButton
        className="flex max-h-[92vh] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden sm:max-w-none"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-2.5 pr-12">
          <DialogTitle className="text-base font-semibold text-foreground">
            Edit Comedian
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <ComicInfoDialogBodySkeleton />
        ) : (
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
              <FormField label="Home Phone">
                <PhoneStringInputGroup
                  idPrefix="comic-home-phone"
                  value={form.homePhone}
                  onChange={(nextValue) => updateField("homePhone", nextValue)}
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
                <CalendarSelectControl
                  id="comic-country"
                  value={form.country}
                  onChange={(value) => updateField("country", value)}
                  placeholder="Select country"
                  className={COMPACT_SELECT}
                  options={COUNTRY_OPTIONS}
                />
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
              <FormField label="Mobile Phone">
                <PhoneStringInputGroup
                  idPrefix="comic-mobile-phone"
                  value={form.mobilePhone}
                  onChange={(nextValue) => updateField("mobilePhone", nextValue)}
                />
              </FormField>
              <FormField label="State">
                <CalendarSelectControl
                  id="comic-state"
                  value={form.state}
                  onChange={(value) => updateField("state", value)}
                  placeholder="Select State"
                  className={COMPACT_SELECT}
                  options={STATE_OPTIONS}
                />
              </FormField>
            </div>

            <div className="space-y-2">
              <FormField label="AltURL" htmlFor="comic-alt-url">
                <Input
                  id="comic-alt-url"
                  value={form.altUrl}
                  onChange={(e) => updateField("altUrl", e.target.value)}
                  className={COMPACT_INPUT}
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
              <FormField label="Fax">
                <PhoneStringInputGroup
                  idPrefix="comic-fax"
                  value={form.fax}
                  onChange={(nextValue) => updateField("fax", nextValue)}
                />
              </FormField>
              <FormField label="Artist Type">
                <CalendarSelectControl
                  id="comic-artist-type"
                  value={form.artistType}
                  onChange={(value) => updateField("artistType", value)}
                  placeholder="Select type"
                  className={COMPACT_SELECT}
                  options={ARTIST_TYPE_OPTIONS}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Preferred Contact">
            <RadioGroup
              value={form.preferredContact}
              onValueChange={(value) => updateField("preferredContact", value)}
              className="flex w-full flex-row flex-wrap items-center gap-x-4 gap-y-2"
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
        )}

        <DialogFooter className="shrink-0 border-t px-4 py-2.5 sm:justify-start">
          <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
