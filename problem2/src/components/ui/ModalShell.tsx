import { type ReactNode, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * The native-dialog plumbing both overlays need: showModal on mount, Esc routed
 * back through React state, and optional backdrop-click close. Using the platform
 * dialog means the focus trap and inert background are not hand-rolled.
 */
export default function ModalShell({
    labelledBy,
    className,
    closeOnBackdropClick = false,
    onClose,
    onKeyDown,
    children,
}: {
    labelledBy: string
    className?: string
    closeOnBackdropClick?: boolean
    onClose: () => void
    onKeyDown?: (event: React.KeyboardEvent) => void
    children: ReactNode
}) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        dialog?.showModal()

        return () => dialog?.close()
    }, [])

    return (
        // The a11y plugin treats <dialog> as non-interactive and objects to
        // handlers on it, but list navigation and backdrop-close are exactly what
        // a native modal dialog is supposed to own. Focus stays inside it, Esc
        // closes it, and every control within is a real button.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <dialog
            ref={dialogRef}
            aria-labelledby={labelledBy}
            onKeyDown={onKeyDown}
            onCancel={(event) => {
                // Esc: close through our own state so React stays in charge.
                event.preventDefault()
                onClose()
            }}
            onClick={
                closeOnBackdropClick
                    ? (event) => {
                          // A click landing on the dialog itself is the backdrop.
                          if (event.target === dialogRef.current) {
                              onClose()
                          }
                      }
                    : undefined
            }
            className={cn(
                "m-auto border border-border bg-surface-1 p-0 text-foreground shadow-card",
                "backdrop:bg-black/70 backdrop:backdrop-blur-sm",
                className
            )}
        >
            {children}
        </dialog>
    )
}
