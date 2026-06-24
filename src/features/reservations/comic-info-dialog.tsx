import { User } from "lucide-react"
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
import { cn } from "@/lib/utils"

const PREFERRED_CONTACT_OPTIONS = [
  { value: "home", label: "Home Phone" },
  { value: "mobile", label: "Mobile Phone" },
  { value: "fax", label: "Fax" },
  { value: "agent", label: "Agent" },
  { value: "email", label: "Email" },
] as const

const FIELD_GRID = "grid gap-3 sm:grid-cols-2"
const FIELD_GRID_3 = "grid gap-3 sm:grid-cols-3"
const PANEL_CLASS = "rounded-lg border border-border/60 bg-background p-3"

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

const COMIC_INFO_TABS = [
  { id: "info" as const, label: "Comedian Info" },
  { id: "contact" as const, label: "Contact & Address" },
]

type ComicInfoTab = (typeof COMIC_INFO_TABS)[number]["id"]

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


function ComicInfoDialogBodySkeleton() {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3" aria-label="Loading edit comic form">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2 lg:w-36">
          <Skeleton className="size-28 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="inline-flex rounded-sm border border-border bg-muted/30 p-0.5">
            <Skeleton className="h-8 w-28 rounded-sm" />
            <Skeleton className="ml-0.5 h-8 w-32 rounded-sm" />
          </div>
          <div className="rounded-lg border border-border/60 bg-background p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <SkeletonField labelWidth="w-16" />
              <SkeletonField labelWidth="w-16" />
              <SkeletonField labelWidth="w-20" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <Skeleton className="mb-1 h-3.5 w-28" />
                <Skeleton className="min-h-20 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-2 lg:col-span-2">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="min-h-16 w-full rounded-md" />
      </section>
    </div>
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
      {COMIC_INFO_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
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

export function ComicInfoDialog({
  open,
  onOpenChange,
  stageName,
  nested = false,
  isLoading = false,
  onSave,
}: ComicInfoDialogProps) {
  const [form, setForm] = useState<ComicInfo>(() => getComicInfo(stageName))
  const [activeTab, setActiveTab] = useState<ComicInfoTab>("info")

  useEffect(() => {
    if (open && !isLoading) {
      setForm(getComicInfo(stageName))
      setActiveTab("info")
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
        disableOutsideDismiss={nested}
        showCloseButton
        className="flex max-h-[88vh] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden sm:max-w-none"
      >
        <DialogHeader className="shrink-0 gap-0 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-lg leading-snug font-normal">
            <span className="font-semibold text-foreground">Edit Comedian</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <ComicInfoDialogBodySkeleton />
        ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="grid gap-4 lg:grid-cols-[8.5rem_minmax(0,1fr)]">
            <aside className={cn(PANEL_CLASS, "flex h-fit flex-col items-center gap-2 bg-muted/15")}>
              <div className="flex size-24 items-center justify-center rounded-md border border-border/60 bg-background">
                <User className="size-12 text-muted-foreground/60" />
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
              >
                Change Image
              </Button>
            </aside>

            <div className="min-w-0 space-y-3">
              <ComicInfoTabs activeTab={activeTab} onTabChange={setActiveTab} />

              <div
                role="tabpanel"
                className={cn(PANEL_CLASS, "min-h-72")}
              >
                {activeTab === "info" ? (
                  <div className="space-y-3">
                    <div className={FIELD_GRID_3}>
                      <FormField label="Last Name" htmlFor="comic-last-name">
                        <Input
                          id="comic-last-name"
                          value={form.lastName}
                          onChange={(e) => updateField("lastName", e.target.value)}
                        />
                      </FormField>
                      <FormField label="First Name" htmlFor="comic-first-name">
                        <Input
                          id="comic-first-name"
                          value={form.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
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
                    <FormField
                      label="About comedian"
                      htmlFor="comic-about"
                    >
                      <Textarea
                        id="comic-about"
                        value={form.about}
                        onChange={(e) => updateField("about", e.target.value)}
                        className="min-h-20 resize-y"
                      />
                    </FormField>
                    <FormField label="Notes">
                      <Textarea
                        value={form.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        className="min-h-16 resize-y"
                      />
                    </FormField>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={FIELD_GRID}>
                      <FormField label="Email" htmlFor="comic-email">
                        <Input
                          id="comic-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                        />
                      </FormField>
                      <FormField label="URL" htmlFor="comic-url">
                        <Input
                          id="comic-url"
                          type="url"
                          value={form.url}
                          onChange={(e) => updateField("url", e.target.value)}
                        />
                      </FormField>
                      <FormField label="Alt URL" htmlFor="comic-alt-url">
                        <Input
                          id="comic-alt-url"
                          type="url"
                          value={form.altUrl}
                          onChange={(e) => updateField("altUrl", e.target.value)}
                        />
                      </FormField>
                      <FormField label="Artist Type">
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

                    <div className={FIELD_GRID}>
                      <FormField label="Address" htmlFor="comic-address">
                        <Input
                          id="comic-address"
                          value={form.address}
                          onChange={(e) => updateField("address", e.target.value)}
                        />
                      </FormField>
                      <FormField label="Address2" htmlFor="comic-address2">
                        <Input
                          id="comic-address2"
                          value={form.address2}
                          onChange={(e) => updateField("address2", e.target.value)}
                        />
                      </FormField>
                      <FormField label="City" htmlFor="comic-city">
                        <Input
                          id="comic-city"
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
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
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select State</SelectItem>
                            {STATE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Zip Code" htmlFor="comic-zip">
                        <Input
                          id="comic-zip"
                          value={form.zipCode}
                          onChange={(e) => updateField("zipCode", e.target.value)}
                        />
                      </FormField>
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

                    <div className={FIELD_GRID_3}>
                      <FormField label="Home Phone" htmlFor="comic-home-phone">
                        <Input
                          id="comic-home-phone"
                          type="tel"
                          value={form.homePhone}
                          onChange={(e) => updateField("homePhone", e.target.value)}
                        />
                      </FormField>
                      <FormField label="Mobile Phone" htmlFor="comic-mobile-phone">
                        <Input
                          id="comic-mobile-phone"
                          type="tel"
                          value={form.mobilePhone}
                          onChange={(e) =>
                            updateField("mobilePhone", e.target.value)
                          }
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

                    <div className="space-y-2">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Preferred Contact
                      </span>
                      <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5">
                        <RadioGroup
                          value={form.preferredContact}
                          onValueChange={(value) =>
                            updateField("preferredContact", value)
                          }
                          className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2"
                        >
                          {PREFERRED_CONTACT_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={`comic-contact-${option.value}`}
                              />
                              {option.label}
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        <DialogFooter className="shrink-0 border-t px-4 py-2.5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
