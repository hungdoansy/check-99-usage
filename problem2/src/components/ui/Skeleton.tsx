import { cn } from "@/lib/utils"

/** Shimmer placeholder shown while the first price fetch is in flight. */
export default function Skeleton({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "relative block overflow-hidden rounded-md bg-surface-3/70",
                "after:absolute after:inset-0 after:-translate-x-full",
                "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
                "after:animate-[shimmer_1.6s_infinite]",
                className
            )}
        />
    )
}
