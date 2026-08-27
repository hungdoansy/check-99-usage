import { useEffect, useState } from "react"

import { RefreshIcon } from "@/components/icons"
import { REFRESH_INTERVAL_MS } from "@/hooks/useTokenPrice"
import { cn } from "@/lib/utils"

const CIRCUMFERENCE = 2 * Math.PI * 9

/**
 * Doubles as the manual refresh control and the countdown to the next automatic
 * poll, so the 5s cadence is visible instead of prices changing unannounced.
 */
export default function RefreshIndicator({
    lastUpdatedAt,
    isRefreshing,
    onRefresh,
}: {
    lastUpdatedAt: number | null
    isRefreshing: boolean
    onRefresh: () => void
}) {
    const progress = useCountdownProgress(lastUpdatedAt)

    return (
        <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh prices now"
            className={cn(
                "group relative flex size-11 items-center justify-center rounded-full",
                "text-subtle transition-colors hover:text-primary"
            )}
        >
            <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                aria-hidden="true"
                className="absolute -rotate-90"
            >
                <circle
                    cx="11"
                    cy="11"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.18"
                />
                <circle
                    cx="11"
                    cy="11"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                    className="text-primary/70"
                />
            </svg>
            <RefreshIcon size={11} className={cn(isRefreshing && "animate-spin")} />
        </button>
    )
}

/** Fraction of the way to the next scheduled poll, 0 to 1. */
function useCountdownProgress(lastUpdatedAt: number | null) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 250)
        return () => window.clearInterval(timer)
    }, [])

    if (lastUpdatedAt === null) {
        return 0
    }

    const elapsed = now - lastUpdatedAt
    return Math.min(1, Math.max(0, elapsed / REFRESH_INTERVAL_MS))
}
