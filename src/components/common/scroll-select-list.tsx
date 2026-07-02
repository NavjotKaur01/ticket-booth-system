import { Check } from "lucide-react"
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type TouchEvent,
  type WheelEvent,
} from "react"

import { cn } from "@/lib/utils"

export type ScrollSelectOption = {
  value: string
  label: string
}

type ScrollSelectListProps = {
  value: string
  options: ScrollSelectOption[]
  onSelect: (value: string) => void
  isOpen: boolean
}

export function getScrollSelectOptions(
  value: string,
  options: ScrollSelectOption[]
) {
  if (!value || options.some((option) => option.value === value)) {
    return options
  }

  return [{ value, label: value }, ...options]
}

export function ScrollSelectList({
  value,
  options,
  onSelect,
  isOpen,
}: ScrollSelectListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const displayOptions = getScrollSelectOptions(value, options)

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return
    }

    const selectedOption =
      listRef.current.querySelector<HTMLButtonElement>("[data-selected='true']") ??
      listRef.current.querySelector<HTMLButtonElement>("[data-scroll-select-option='true']")

    selectedOption?.scrollIntoView({ block: "center" })
    requestAnimationFrame(() => selectedOption?.focus({ preventScroll: true }))
  }, [displayOptions.length, isOpen, value])

  function getOptionButtons() {
    return Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-scroll-select-option='true']"
      ) ?? []
    )
  }

  function focusOption(index: number) {
    const buttons = getOptionButtons()
    const nextButton = buttons[index]
    nextButton?.focus({ preventScroll: true })
    nextButton?.scrollIntoView({ block: "nearest" })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = getOptionButtons()
    if (buttons.length === 0) {
      return
    }

    const activeIndex = buttons.findIndex((button) => button === document.activeElement)
    const selectedIndex = Math.max(
      0,
      buttons.findIndex((button) => button.dataset.selected === "true")
    )
    const currentIndex = activeIndex >= 0 ? activeIndex : selectedIndex

    if (event.key === "ArrowDown") {
      event.preventDefault()
      focusOption(Math.min(currentIndex + 1, buttons.length - 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      focusOption(Math.max(currentIndex - 1, 0))
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      focusOption(0)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      focusOption(buttons.length - 1)
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.stopPropagation()
    event.currentTarget.scrollTop += event.deltaY
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <div
      ref={listRef}
      className="calendar-thin-scrollbar max-h-44 touch-pan-y overscroll-contain overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]"
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
    >
      {displayOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          data-scroll-select-option="true"
          data-selected={option.value === value ? "true" : undefined}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-sm px-2 text-left text-sm outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
            option.value === value && "bg-primary/10 text-primary"
          )}
          onClick={() => onSelect(option.value)}
        >
          <span className="truncate">{option.label}</span>
          {option.value === value ? <Check className="size-3.5 shrink-0" /> : null}
        </button>
      ))}
    </div>
  )
}
