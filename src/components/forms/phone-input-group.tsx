import { useRef, type KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getNextPhoneSegmentField,
  getPreviousPhoneSegmentField,
  mergePhoneDigits,
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
    const next = mergePhoneDigits(value, field, rawValue)
    onChange(next)

    const nextField = getNextPhoneSegmentField(field, next[field])
    if (nextField) {
      focusSegment(nextField)
    }
  }

  function handleKeyDown(field: PhoneSegmentField, event: KeyboardEvent<HTMLInputElement>) {
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
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <Input
        ref={areaRef}
        id={`${idPrefix}-area`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.area}
        placeholder="918"
        value={value.area}
        onChange={(event) => handleSegmentChange("area", event.target.value)}
        onKeyDown={(event) => handleKeyDown("area", event)}
        className={cn(SEGMENT_INPUT_CLASS, "w-[4.25rem]")}
      />
      <Input
        ref={prefixRef}
        id={`${idPrefix}-prefix`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.prefix}
        value={value.prefix}
        onChange={(event) => handleSegmentChange("prefix", event.target.value)}
        onKeyDown={(event) => handleKeyDown("prefix", event)}
        className={cn(SEGMENT_INPUT_CLASS, "w-[4.25rem]")}
      />
      <Input
        ref={lineRef}
        id={`${idPrefix}-line`}
        inputMode="numeric"
        maxLength={PHONE_SEGMENT_LENGTHS.line}
        value={value.line}
        onChange={(event) => handleSegmentChange("line", event.target.value)}
        onKeyDown={(event) => handleKeyDown("line", event)}
        className={cn(SEGMENT_INPUT_CLASS, "w-[4.5rem]")}
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
