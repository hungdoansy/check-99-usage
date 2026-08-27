import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

/**
 * Token artwork. Several logos in this set are dark shapes on a transparent
 * ground, so they sit on a light backdrop to stay visible on the dark theme.
 */
export default function TokenIcon({
    token,
    size,
    dimmed,
    className,
}: {
    token: Token
    size: number
    dimmed?: boolean
    className?: string
}) {
    return (
        <img
            src={token.icon}
            alt=""
            width={size}
            height={size}
            style={{ width: size, height: size }}
            className={cn(
                "shrink-0 rounded-full bg-white/10 object-contain",
                dimmed && "opacity-45",
                className
            )}
        />
    )
}
