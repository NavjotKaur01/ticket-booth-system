import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DomainFormValues } from "@/types/domain"

const ACTIVE_INDICATOR_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

type DomainFormFieldsProps = {
  form: DomainFormValues
  onFieldChange: <K extends keyof DomainFormValues>(
    field: K,
    value: DomainFormValues[K]
  ) => void
}

export function DomainFormFields({
  form,
  onFieldChange,
}: DomainFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <FormField label="Domain Name" htmlFor="domain-name">
        <Input
          id="domain-name"
          value={form.domainName}
          onChange={(event) => onFieldChange("domainName", event.target.value)}
          placeholder="Enter domain name"
        />
      </FormField>

      <FormField label="Location ID" htmlFor="location-id">
        <Input
          id="location-id"
          value={form.locationId}
          onChange={(event) => onFieldChange("locationId", event.target.value)}
          placeholder="Enter location ID"
        />
      </FormField>

      <FormField label="Active Indicator" htmlFor="active-indicator">
        <Select
          value={form.activeIndicator}
          onValueChange={(value) =>
            onFieldChange("activeIndicator", value as DomainFormValues["activeIndicator"])
          }
        >
          <SelectTrigger id="active-indicator" className="w-full">
            <SelectValue placeholder="Select indicator" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_INDICATOR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Processing Order" htmlFor="processing-order">
        <Input
          id="processing-order"
          type="number"
          min={1}
          value={form.processingOrder}
          onChange={(event) => onFieldChange("processingOrder", event.target.value)}
          placeholder="Enter processing order"
        />
      </FormField>
    </div>
  )
}
