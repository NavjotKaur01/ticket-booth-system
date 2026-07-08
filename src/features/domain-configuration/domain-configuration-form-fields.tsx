import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DomainConfigurationFormValues } from "@/types/domain-configuration"

const ACTIVE_INDICATOR_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

type DomainConfigurationFormFieldsProps = {
  form: DomainConfigurationFormValues
  onFieldChange: <K extends keyof DomainConfigurationFormValues>(
    field: K,
    value: DomainConfigurationFormValues[K]
  ) => void
}

export function DomainConfigurationFormFields({
  form,
  onFieldChange,
}: DomainConfigurationFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <FormField label="Server IP" htmlFor="server-ip">
        <Input
          id="server-ip"
          value={form.serverIp}
          onChange={(event) => onFieldChange("serverIp", event.target.value)}
          placeholder="Enter server IP"
        />
      </FormField>

      <FormField label="Server Name" htmlFor="server-name">
        <Input
          id="server-name"
          value={form.serverName}
          onChange={(event) => onFieldChange("serverName", event.target.value)}
          placeholder="Enter server name"
        />
      </FormField>

      <FormField label="Active Indicator" htmlFor="active-indicator">
        <Select
          value={form.activeIndicator}
          onValueChange={(value) =>
            onFieldChange(
              "activeIndicator",
              value as DomainConfigurationFormValues["activeIndicator"]
            )
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
    </div>
  )
}
