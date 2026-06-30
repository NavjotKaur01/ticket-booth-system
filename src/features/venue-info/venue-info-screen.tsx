import {
  Building2,
  LoaderCircle,
  MapPinned,
  Phone,
  Save,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSession } from "@/hooks/use-app-session"
import {
  getVenueInfoByLocation,
  updateVenueInfo,
  VENUE_STATE_OPTIONS,
} from "@/features/venue-info/venue-info.service"
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
      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function FieldShell({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`space-y-2 ${className}`.trim()}>{children}</div>
}

function LoadingFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
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
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load venue info."
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
      setSaveMessage(`Venue info updated for ${savedRecord.locationLabel}.`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update venue info."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Venue Info
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage venue names, address details, and contact numbers for each
          location.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="px-4 py-4">
          <div className="rounded-sm border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Required fields are marked with <RequiredMark /> and currently use
            mock service data so we can switch to the real API later without
            changing the page structure.
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b bg-muted/40 px-4 py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Venue Info Data
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-4 py-5">
          {error ? (
            <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!locationId ? (
            <VenueNoLocationState featureLabel="Venue info" />
          ) : loading || !form ? (
            <>
              <LoadingFields />
              <Separator />
              <LoadingFields />
            </>
          ) : (
            <>
              <section className="space-y-4">
                <SectionHeading icon={Building2} title="Venue Names" />
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionHeading icon={MapPinned} title="Venue Address" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FieldShell className="md:col-span-2 xl:col-span-1">
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

                  <FieldShell className="md:col-span-2 xl:col-span-1">
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

                  <div className="hidden xl:block" />

                  <FieldShell>
                    <Label htmlFor="venue-city">
                      City <RequiredMark />
                    </Label>
                    <Input
                      id="venue-city"
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      placeholder="Enter city"
                    />
                  </FieldShell>

                  <FieldShell>
                    <Label htmlFor="venue-state">
                      State/Province <RequiredMark />
                    </Label>
                    <Select
                      value={form.stateProvince}
                      onValueChange={(value) => updateField("stateProvince", value)}
                    >
                      <SelectTrigger id="venue-state" className="w-full bg-background">
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
              </section>

              <Separator />

              <section className="space-y-4">
                <SectionHeading icon={Phone} title="Phones and Fax" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FieldShell>
                    <Label htmlFor="venue-phone">Phone</Label>
                    <Input
                      id="venue-phone"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
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
                      placeholder="Ext"
                    />
                  </FieldShell>

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
                </div>
              </section>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
          <div aria-live="polite" className="text-sm text-muted-foreground">
            {locationId
              ? saveMessage || "Use Update to save the current venue info mock state."
              : "Select a location from the header to begin editing venue info."}
          </div>
          <Button
            type="button"
            onClick={() => void handleUpdate()}
            disabled={!canSave || !locationId || loading || saving || form == null}
            className="gap-2"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Update
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

