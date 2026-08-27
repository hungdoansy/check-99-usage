import { useState } from "react"

import RefreshIndicator from "@/components/swap/RefreshIndicator"
import { formatRate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

export default function RateLine({
    sellToken,
    buyToken,
    rate,
    lastUpdatedAt,
    isRefreshing,
    onRefresh,
}: {
    sellToken: Token
    buyToken: Token
    rate: number | undefined
    lastUpdatedAt: number | null
    isRefreshing: boolean
    onRefresh: () => void
}) {
    const [inverted, setInverted] = useState(false)

    const base = inverted ? buyToken : sellToken
    const quote = inverted ? sellToken : buyToken
    const shown = rate === undefined ? undefined : inverted ? 1 / rate : rate
    const shownText = shown === undefined ? "" : formatRate(shown)

    return (
        <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-1">
            <button
                type="button"
                onClick={() => setInverted((current) => !current)}
                disabled={shown === undefined}
                aria-label="Invert the displayed exchange rate"
                className={cn(
                    "tap-expand flex items-center gap-1.5 rounded-full py-1.5 text-xs text-muted",
                    "transition-colors enabled:hover:text-foreground disabled:opacity-60"
                )}
            >
                {shown === undefined ? (
                    <span>Rate unavailable</span>
                ) : (
                    <span translate="no">
                        1 {base.symbol} ={" "}
                        {/* Keying on the value remounts the span so the pulse
                            animation replays whenever a poll moves the rate. */}
                        <span
                            key={shownText}
                            className="animate-[value-pulse_700ms_ease-out] font-medium tabular-nums text-foreground"
                        >
                            {shownText}
                        </span>{" "}
                        {quote.symbol}
                    </span>
                )}
            </button>

            {/* Announces rate movement to screen readers without moving focus. */}
            <span aria-live="polite" className="sr-only">
                {shown === undefined
                    ? "Exchange rate unavailable"
                    : `1 ${base.symbol} equals ${shownText} ${quote.symbol}`}
            </span>

            <RefreshIndicator
                lastUpdatedAt={lastUpdatedAt}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
            />
        </div>
    )
}
