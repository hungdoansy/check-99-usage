import { useCallback, useEffect, useState } from "react"

import TokenIcon from "@/components/ui/TokenIcon"
import { ArrowRightIcon, CloseIcon } from "@/components/icons"
import { formatRate, formatTokenBalance } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

export interface SwapReceipt {
    from: Token
    to: Token
    fromAmount: number
    toAmount: number
    /** Captured at submit, so it reflects the executed quote rather than a later poll. */
    rate: number
}

const AUTO_DISMISS_MS = 7000
const EXIT_MS = 220

export default function SwapToast({
    receipt,
    onClose,
}: {
    receipt: SwapReceipt
    onClose: () => void
}) {
    const [isLeaving, setIsLeaving] = useState(false)

    const beginExit = useCallback(() => setIsLeaving(true), [])

    useEffect(() => {
        const timer = window.setTimeout(beginExit, AUTO_DISMISS_MS)

        return () => window.clearTimeout(timer)
    }, [beginExit])

    // Unmount only after the exit animation has actually played.
    useEffect(() => {
        if (!isLeaving) {
            return
        }

        const timer = window.setTimeout(onClose, EXIT_MS)

        return () => window.clearTimeout(timer)
    }, [isLeaving, onClose])

    return (
        <output
            // <output> carries the status role implicitly. Non-modal by design: it
            // announces itself and never takes focus, so a keyboard user is not
            // interrupted mid-form.
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end"
        >
            <div
                className={cn(
                    "pointer-events-auto relative w-full overflow-hidden sm:w-[352px]",
                    "rounded-tile border border-border bg-surface-2/95 shadow-card backdrop-blur-md",
                    isLeaving
                        ? "animate-[toast-out_220ms_ease-in_forwards]"
                        : "animate-[toast-in_280ms_cubic-bezier(0.22,1,0.36,1)]"
                )}
            >
                {/* Brand accent instead of an icon badge: it identifies the toast
                    without competing with the token artwork below. */}
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-primary" />

                <div className="pl-4 pr-3 pt-3 pb-3.5">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                            Swap simulated
                        </p>
                        <button
                            type="button"
                            onClick={beginExit}
                            aria-label="Dismiss confirmation"
                            className="tap-expand -mr-1 -mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:text-foreground"
                        >
                            <CloseIcon size={14} />
                        </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2.5" translate="no">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <TokenIcon token={receipt.from} size={20} />
                            <span className="truncate text-[15px] font-semibold tabular-nums">
                                {formatTokenBalance(receipt.fromAmount)}
                            </span>
                            <span className="text-xs text-subtle">{receipt.from.symbol}</span>
                        </span>

                        <ArrowRightIcon size={14} className="shrink-0 text-subtle" />

                        <span className="flex min-w-0 items-center gap-1.5">
                            <TokenIcon token={receipt.to} size={20} />
                            <span className="truncate text-[15px] font-semibold tabular-nums text-primary">
                                {formatTokenBalance(receipt.toAmount)}
                            </span>
                            <span className="text-xs text-subtle">{receipt.to.symbol}</span>
                        </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-subtle" translate="no">
                        1 {receipt.from.symbol} = {formatRate(receipt.rate)} {receipt.to.symbol}
                        <span className="mx-1.5 opacity-50">·</span>
                        balances updated
                    </p>
                </div>

                {/* Drains over the auto-dismiss window so the disappearance is predictable. */}
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 block h-px origin-left animate-[toast-timer_7000ms_linear_forwards] bg-primary/40"
                />
            </div>
        </output>
    )
}
