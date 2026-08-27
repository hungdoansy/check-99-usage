import { RefreshIcon, WarningIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

/**
 * Two distinct failure shapes, deliberately not collapsed into one message:
 * "unavailable" means there is nothing to quote from, "stale" means the numbers
 * on screen are real but no longer fresh.
 */
export default function PriceFeedNotice({
    variant,
    isRetrying,
    onRetry,
}: {
    variant: "unavailable" | "stale"
    isRetrying: boolean
    onRetry: () => void
}) {
    const isBlocking = variant === "unavailable"

    return (
        <div
            role={isBlocking ? "alert" : "status"}
            className={cn(
                "mb-3 flex items-center gap-2.5 rounded-tile border px-3.5 py-2.5 text-xs",
                isBlocking
                    ? "border-destructive/40 bg-destructive/10 text-foreground"
                    : "border-warning/30 bg-warning/10 text-muted"
            )}
        >
            <WarningIcon
                size={15}
                className={cn("shrink-0", isBlocking ? "text-destructive" : "text-warning")}
            />
            <p className="flex-1">
                {isBlocking
                    ? "Couldn’t load prices, so amounts can’t be quoted."
                    : "Showing the last known prices - the latest refresh failed."}
            </p>
            <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1.5 font-medium text-foreground transition-colors enabled:hover:bg-surface-3/70 disabled:opacity-60"
            >
                <RefreshIcon size={12} className={cn(isRetrying && "animate-spin")} />
                {isRetrying ? "Retrying" : "Retry"}
            </button>
        </div>
    )
}
