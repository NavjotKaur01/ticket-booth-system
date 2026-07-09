import { useRef, type KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getNextPhoneSegmentField,
  getPreviousPhoneSegmentField,
  updatePhoneSegment,
  parsePhoneString,
  PHONE_SEGMENT_LENGTHS,
  formatPhoneParts,
  type PhoneParts,
  type PhoneSegmentField,
} from "@/lib/phone-segment-input"

export type { PhoneParts } from "@/lib/phone-segment-input"
export { EMPTY_PHONE_PARTS } from "@/lib/phone-segment-input"

type PhoneInputGroupProps = {
  value: PhoneParts
  onChange: (value: PhoneParts) => void
  idPrefix: string
  className?: string
  onBlur?: () => void
  onEnter?: () => void
}

type PhoneStringInputGroupProps = {
  value: string
  onChange: (value: string) => void
  idPrefix: string
  className?: string
}

const SEGMENT_INPUT_CLASS =
  "h-9 shrink-0 px-2 text-center tabular-nums"

export function PhoneInputGroup({
  value,
  onChange,
  idPrefix,
  className,
  onBlur,
  onEnter,
}: PhoneInputGroupProps) {
  const areaRef = useRef<HTMLInputElement>(null)
  const prefixRef = useRef<HTMLInputElement>(null)
  const lineRef = useRef<HTMLInputElement>(null)

  const segmentRefs: Record<PhoneSegmentField, React.RefObject<HTMLInputElement | null>> = {
    area: areaRef,
    prefix: prefixRef,
    line: lineRef,
  }

  function focusSegment(field: PhoneSegmentField) {
    const input = segmentRefs[field].current
    input?.focus()

    const length = value[field].length
    if (length > 0) {
      input?.setSelectionRange(length, length)
    }
  }

  function handleSegmentChange(field: PhoneSegmentField, rawValue: string) {
    const next = updatePhoneSegment(value, field, rawValue)
    onChange(next)

    const nextField = getNextPhoneSegmentField(field, next[field])
    if (nextField) {
      focusSegment(nextField)
    }
  }

  function handleKeyDown(field: PhoneSegmentField, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      onEnter?.()
      return
    }

    if (event.key !== "Backspace" || value[field].length > 0) {
      return
    }

    const previousField = getPreviousPhoneSegmentField(field)
    if (!previousField) {
      return
    }

    event.preventDefault()
    focusSegment(previousField)
  }

  return (
    <div className={cn("grid grid-cols-4 gap-x-2.5", className)}>
      <Input
        ref={areaRef}
        id={`${idPrefix}-area`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.area}
        value={value.area}
        onChange={(event) => handleSegmentChange("area", event.target.value)}
        onKeyDown={(event) => handleKeyDown("area", event)}
        onBlur={onBlur}
        className={cn(SEGMENT_INPUT_CLASS)}
      />
      <Input
        ref={prefixRef}
        id={`${idPrefix}-prefix`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.prefix}
        value={value.prefix}
        onChange={(event) => handleSegmentChange("prefix", event.target.value)}
        onKeyDown={(event) => handleKeyDown("prefix", event)}
        onBlur={onBlur}
        className={cn(SEGMENT_INPUT_CLASS)}
      />
      <Input
        ref={lineRef}
        id={`${idPrefix}-line`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.line}
        value={value.line}
        onChange={(event) => handleSegmentChange("line", event.target.value)}
        onKeyDown={(event) => handleKeyDown("line", event)}
        onBlur={onBlur}
        className={cn(SEGMENT_INPUT_CLASS, "col-span-2")}
      />
    </div>
  )
}

export function PhoneStringInputGroup({
  value,
  onChange,
  idPrefix,
  className,
}: PhoneStringInputGroupProps) {
  return (
    <PhoneInputGroup
      idPrefix={idPrefix}
      value={parsePhoneString(value)}
      onChange={(parts) => onChange(formatPhoneParts(parts))}
      className={className}
    />
  )
}
