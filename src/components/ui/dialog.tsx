import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-white/20",
        className
      )}
      {...props}
    />
  )
}

type OutsideDismissEvent = {
  target: EventTarget | null
  currentTarget: EventTarget | null
  preventDefault: () => void
}

function isWithinAnotherDialogContent(
  target: EventTarget | null,
  currentContent: EventTarget | null
) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const dialogContents = document.querySelectorAll('[data-slot="dialog-content"]')
  for (const content of Array.from(dialogContents)) {
    if (content !== currentContent && content.contains(target)) {
      return true
    }
  }

  return false
}

function hasOpenStackedDialog(currentContent: EventTarget | null) {
  const contents = document.querySelectorAll('[data-slot="dialog-content"]')
  if (contents.length <= 1) {
    return false
  }

  const currentIndex = Array.from(contents).indexOf(currentContent as Element)
  return currentIndex >= 0 && currentIndex < contents.length - 1
}

function shouldPreventOutsideDismiss(
  event: OutsideDismissEvent,
  disableOutsideDismiss: boolean
) {
  if (disableOutsideDismiss) {
    event.preventDefault()
    return
  }

  if (
    isWithinAnotherDialogContent(event.target, event.currentTarget) ||
    hasOpenStackedDialog(event.currentTarget)
  ) {
    event.preventDefault()
  }
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  disableOutsideDismiss = false,
  nested = false,
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  onEscapeKeyDown,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  disableOutsideDismiss?: boolean
  nested?: boolean
}) {
  const stackClass = nested ? "z-[60]" : "z-50"

  const handleOutsideEvent = <T extends OutsideDismissEvent>(
    event: T,
    userHandler?: (event: T) => void
  ) => {
    userHandler?.(event)
    shouldPreventOutsideDismiss(event, disableOutsideDismiss)
  }

  return (
    <DialogPortal>
      <DialogOverlay className={stackClass} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-fit max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-0 rounded-lg border border-border/80 bg-background p-0 shadow-xl ring-1 ring-background/40 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-lg",
          stackClass,
          className
        )}
        onInteractOutside={(event) => handleOutsideEvent(event, onInteractOutside)}
        onPointerDownOutside={(event) =>
          handleOutsideEvent(event, onPointerDownOutside)
        }
        onFocusOutside={(event) => handleOutsideEvent(event, onFocusOutside)}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event)
          if (hasOpenStackedDialog(event.currentTarget)) {
            event.preventDefault()
          }
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (nested) {
            event.preventDefault()
          }
        }}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-2 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:pointer-events-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
