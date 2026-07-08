import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import type { VenueGatewayFormValues } from "@/types/venue-gateway"

type VenueGatewayFormFieldsProps = {
  form: VenueGatewayFormValues
  onFieldChange: <K extends keyof VenueGatewayFormValues>(
    field: K,
    value: VenueGatewayFormValues[K]
  ) => void
}

export function VenueGatewayFormFields({
  form,
  onFieldChange,
}: VenueGatewayFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <FormField label="Venue" htmlFor="venue">
        <Input
          id="venue"
          value={form.venue}
          onChange={(event) => onFieldChange("venue", event.target.value)}
          placeholder="Enter venue"
        />
      </FormField>

      <FormField label="Gateway" htmlFor="gateway">
        <Input
          id="gateway"
          value={form.gateway}
          onChange={(event) => onFieldChange("gateway", event.target.value)}
          placeholder="Enter gateway"
        />
      </FormField>

      <FormField label="Partner" htmlFor="partner">
        <Input
          id="partner"
          value={form.partner}
          onChange={(event) => onFieldChange("partner", event.target.value)}
          placeholder="Enter partner"
        />
      </FormField>

      <FormField label="Vendor" htmlFor="vendor">
        <Input
          id="vendor"
          value={form.vendor}
          onChange={(event) => onFieldChange("vendor", event.target.value)}
          placeholder="Enter vendor"
        />
      </FormField>

      <FormField label="User" htmlFor="user">
        <Input
          id="user"
          value={form.user}
          onChange={(event) => onFieldChange("user", event.target.value)}
          placeholder="Enter user"
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          value={form.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          placeholder="Enter password"
        />
      </FormField>
    </div>
  )
}
