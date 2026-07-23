import {
  Building2,
  LoaderCircle,
  MapPinned,
  Phone,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import {
  AdminPageShell,
  AdminPageTitle,
} from "@/components/layout/admin-page"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, toastSuccess } from "@/lib/app-toast"
import {
  getVenueInfoByLocation,
  updateVenueInfo,
  VENUE_STATE_OPTIONS,
} from "@/features/venue-info/venue-info.service"
import { cn } from "@/lib/utils"
import type { VenueInfoRecord } from "@/types/venue-info"

const REQUIRED_FIELDS: (keyof VenueInfoRecord)[] = [
  "venueName",
  "shortName",
  "address1",
  "city",
  "stateProvince",
  "postalCode",
]

function RequiredMark() {
  return <span className="text-destructive">*</span>
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof Building2
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function FieldShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>
}

function FormPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("min-w-0 space-y-3 p-4", className)}>{children}</section>
  )
}

function LoadingFields() {
  return (
    <div className="grid min-w-0 grid-cols-1 divide-y md:grid-cols-2 xl:grid-cols-3 xl:divide-y-0">
      {Array.from({ length: 3 }).map((_, panelIndex) => (
        <div
          key={panelIndex}
          className={cn(
            "space-y-3 p-4 md:odd:border-r xl:border-r xl:last:border-r-0",
            panelIndex === 2 && "md:col-span-2 xl:col-span-1 md:border-r-0"
          )}
        >
          <Skeleton className="h-7 w-36" />
          {Array.from({ length: panelIndex === 1 ? 4 : 3 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function VenueInfoScreen() {
  const { locationId, locationName } = useAppSession()

  const [form, setForm] = useState<VenueInfoRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!locationId) {
      setForm(null)
      setLoading(false)
      setError(null)
      setSaveMessage(null)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)
    setSaveMessage(null)
    setForm(null)

    getVenueInfoByLocation({
      locationId,
      locationLabel: locationName,
    })
      .then((result) => {
        if (isActive) {
          setForm(result)
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          reportError(setError, requestError, "Unable to load venue info.")
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

  function updateField<K extends keyof VenueInfoRecord>(
    key: K,
    value: VenueInfoRecord[K]
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current))
    setSaveMessage(null)
    setError(null)
  }

  const canSave =
    form != null &&
    REQUIRED_FIELDS.every((key) => String(form[key] || "").trim().length > 0)

  async function handleUpdate() {
    if (!form || !canSave || saving) {
      return
    }

    setSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      const savedRecord = await updateVenueInfo(form)
      setForm(savedRecord)
      const message = `Venue info updated for ${savedRecord.locationLabel}.`
      setSaveMessage(message)
      toastSuccess(message)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to update venue info.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <AdminPageTitle>Venue Info</AdminPageTitle>
          <p className="text-sm text-muted-foreground">
            Manage venue names, address details, and contact numbers for each
            location.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleUpdate()}
          disabled={!canSave || !locationId || loading || saving || form == null}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Update
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b bg-muted/40 px-4 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Venue Info Data
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Required fields marked with <RequiredMark /> · mock data until API
              is connected
            </p>
          </div>
        </CardHeader>

        {error ? (
          <div className="border-b px-4 py-3">
            <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          </div>
        ) : null}

        <CardContent className="p-0">
          {!locationId ? (
            <div className="px-4 py-5">
              <VenueNoLocationState featureLabel="Venue info" />
            </div>
          ) : loading || !form ? (
            <LoadingFields />
          ) : (
            <div className="grid min-w-0 grid-cols-1 divide-y md:grid-cols-2 xl:grid-cols-3 xl:divide-y-0">
              <FormPanel className="md:border-r">
                <SectionHeading icon={Building2} title="Venue Names" />
                <FieldShell>
                  <Label htmlFor="venue-name">
                    Venue Name <RequiredMark />
                  </Label>
                  <Input
                    id="venue-name"
                    value={form.venueName}
                    onChange={(event) =>
                      updateField("venueName", event.target.value)
                    }
                    placeholder="Enter venue name"
                  />
                </FieldShell>
                <FieldShell>
                  <Label htmlFor="venue-short-name">
                    Short Name <RequiredMark />
                  </Label>
                  <Input
                    id="venue-short-name"
                    value={form.shortName}
                    onChange={(event) =>
                      updateField("shortName", event.target.value)
                    }
                    placeholder="Enter short venue name"
                  />
                </FieldShell>
              </FormPanel>

              <FormPanel className="xl:border-r">
                <SectionHeading icon={MapPinned} title="Venue Address" />
                <FieldShell>
                  <Label htmlFor="address-1">
                    Address 1 <RequiredMark />
                  </Label>
                  <Input
                    id="address-1"
                    value={form.address1}
                    onChange={(event) =>
                      updateField("address1", event.target.value)
                    }
                    placeholder="Enter address line 1"
                  />
                </FieldShell>
                <FieldShell>
                  <Label htmlFor="address-2">Address 2</Label>
                  <Input
                    id="address-2"
                    value={form.address2}
                    onChange={(event) =>
                      updateField("address2", event.target.value)
                    }
                    placeholder="Apartment, suite, floor, etc."
                  />
                </FieldShell>
                <FieldShell>
                  <Label htmlFor="venue-city">
                    City <RequiredMark />
                  </Label>
                  <Input
                    id="venue-city"
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    placeholder="Enter city"
                  />
                </FieldShell>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                  <FieldShell>
                    <Label htmlFor="venue-state">
                      State/Province <RequiredMark />
                    </Label>
                    <Select
                      value={form.stateProvince}
                      onValueChange={(value) =>
                        updateField("stateProvince", value)
                      }
                    >
                      <SelectTrigger
                        id="venue-state"
                        className="w-full min-w-0 bg-background"
                      >
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72" position="popper">
                        {VENUE_STATE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldShell>
                  <FieldShell>
                    <Label htmlFor="venue-postal-code">
                      Zip/Postal Code <RequiredMark />
                    </Label>
                    <Input
                      id="venue-postal-code"
                      value={form.postalCode}
                      onChange={(event) =>
                        updateField("postalCode", event.target.value)
                      }
                      placeholder="Enter postal code"
                    />
                  </FieldShell>
                </div>
              </FormPanel>

              <FormPanel className="md:col-span-2 xl:col-span-1">
                <SectionHeading icon={Phone} title="Phones and Fax" />
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-[minmax(0,1fr)_minmax(6.5rem,8rem)]">
                  <FieldShell>
                    <Label htmlFor="venue-phone">Phone</Label>
                    <Input
                      id="venue-phone"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="(000) 000-0000"
                    />
                  </FieldShell>
                  <FieldShell>
                    <Label htmlFor="venue-extension">Extension</Label>
                    <Input
                      id="venue-extension"
                      value={form.extension}
                      onChange={(event) =>
                        updateField("extension", event.target.value)
                      }
                      placeholder="Extension"
                    />
                  </FieldShell>
                </div>
                <FieldShell>
                  <Label htmlFor="venue-phone-text">Phone Text Alternative</Label>
                  <Input
                    id="venue-phone-text"
                    value={form.phoneTextAlternative}
                    onChange={(event) =>
                      updateField("phoneTextAlternative", event.target.value)
                    }
                    placeholder="Alternate phone number"
                  />
                </FieldShell>
                <FieldShell>
                  <Label htmlFor="venue-fax">Fax</Label>
                  <Input
                    id="venue-fax"
                    value={form.fax}
                    onChange={(event) => updateField("fax", event.target.value)}
                    placeholder="(000) 000-0000"
                  />
                </FieldShell>
              </FormPanel>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t px-4 py-3">
          <div
            aria-live="polite"
            className="min-w-0 break-words text-sm text-muted-foreground"
          >
            {locationId
              ? saveMessage ||
              "Use Update to save the current venue info mock state."
              : "Select a location from the header to begin editing venue info."}
          </div>
        </CardFooter>
      </Card>
    </AdminPageShell>
  )
}
