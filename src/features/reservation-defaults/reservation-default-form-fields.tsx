import { FormField } from "@/components/forms/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ReservationDefaultFormValues } from "@/types/reservation-default"

const YES_NO_OPTIONS = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
] as const

type ReservationDefaultFormFieldsProps = {
  form: ReservationDefaultFormValues
  onFieldChange: <K extends keyof ReservationDefaultFormValues>(
    field: K,
    value: ReservationDefaultFormValues[K]
  ) => void
}

export function ReservationDefaultFormFields({
  form,
  onFieldChange,
}: ReservationDefaultFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <FormField label="Default Name" htmlFor="default-name">
        <Input
          id="default-name"
          value={form.defaultName}
          onChange={(event) => onFieldChange("defaultName", event.target.value)}
        />
      </FormField>

      <FormField label="Default Value" htmlFor="default-value">
        <Textarea
          id="default-value"
          value={form.defaultValue}
          onChange={(event) => onFieldChange("defaultValue", event.target.value)}
          rows={4}
        />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <Input
          id="description"
          value={form.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Active" htmlFor="active">
          <Select
            value={form.active}
            onValueChange={(value) =>
              onFieldChange("active", value as ReservationDefaultFormValues["active"])
            }
          >
            <SelectTrigger id="active" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YES_NO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Show Club" htmlFor="show-club">
          <Select
            value={form.showClub}
            onValueChange={(value) =>
              onFieldChange("showClub", value as ReservationDefaultFormValues["showClub"])
            }
          >
            <SelectTrigger id="show-club" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YES_NO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Screen" htmlFor="screen">
          <Input
            id="screen"
            type="number"
            min={1}
            value={form.screen}
            onChange={(event) => onFieldChange("screen", event.target.value)}
          />
        </FormField>

        <FormField label="Default Type" htmlFor="default-type">
          <Input
            id="default-type"
            value={form.defaultType}
            onChange={(event) => onFieldChange("defaultType", event.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Updated By" htmlFor="updated-by">
          <Input
            id="updated-by"
            value={form.updatedBy}
            onChange={(event) => onFieldChange("updatedBy", event.target.value)}
          />
        </FormField>

        <FormField label="Updated Date" htmlFor="updated-date">
          <Input
            id="updated-date"
            value={form.updatedDate}
            onChange={(event) => onFieldChange("updatedDate", event.target.value)}
          />
        </FormField>
      </div>
    </div>
  )
}
