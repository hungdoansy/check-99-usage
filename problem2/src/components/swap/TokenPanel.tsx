import { NumericFormat } from "react-number-format"

import Skeleton from "@/components/ui/Skeleton"
import TokenIcon from "@/components/ui/TokenIcon"
import { ChevronDownIcon, WalletIcon } from "@/components/icons"
import { formatTokenBalance, formatUSDValue } from "@/lib/format"
import { AMOUNT_DECIMALS, toAmountString } from "@/lib/swap"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

const PERCENTS = [25, 50, 75] as const

/** Balance shortcut. Kept visually small; `tap-expand` gives it a 44x44 hit area. */
function FractionChip({
    label,
    emphasis,
    disabled,
    onClick,
}: {
    label: string
    emphasis?: boolean
    disabled: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "tap-expand min-w-11 rounded-md px-1.5 py-1.5 text-[10px] font-semibold leading-none",
                "transition-colors disabled:opacity-40",
                emphasis
                    ? "bg-primary/15 text-primary enabled:hover:bg-primary/25"
                    : "bg-surface-3 text-muted enabled:hover:bg-primary/15 enabled:hover:text-primary"
            )}
        >
            {label}
        </button>
    )
}

/** Character count as the field actually renders it, thousand separators included. */
function displayedLength(amount: string): number {
    if (!amount) {
        return 1
    }

    const [integerPart = "", fractionPart] = amount.split(".")
    const separators = Math.max(0, Math.floor((integerPart.length - 1) / 3))

    return (
        integerPart.length + separators + (fractionPart === undefined ? 0 : fractionPart.length + 1)
    )
}

/** Mobile size first, then the roomier desktop size. */
function amountSizeFor(length: number): string {
    if (length > 16) {
        return "text-[0.8rem] sm:text-lg"
    }
    if (length > 13) {
        return "text-[0.95rem] sm:text-xl"
    }
    if (length > 10) {
        return "text-lg sm:text-2xl"
    }
    if (length > 8) {
        return "text-2xl sm:text-[1.75rem]"
    }
    return "text-[1.75rem] sm:text-[2rem]"
}

export default function TokenPanel({
    variant,
    token,
    amount,
    usd,
    balance,
    hasPrice,
    showSkeleton,
    onAmountChange,
    onOpenSelector,
}: {
    variant: "sell" | "buy"
    token: Token
    amount: string
    usd: number | undefined
    balance: number
    hasPrice: boolean
    showSkeleton: boolean
    onAmountChange: (value: string) => void
    onOpenSelector: () => void
}) {
    const isSell = variant === "sell"
    const canUseBalance = isSell && balance > 0

    // Long converted amounts (a cheap token bought with an expensive one) would
    // otherwise clip against the token pill, so the display shrinks with length.
    // Digits are tabular, so the rendered width is predictable - but the measure
    // has to count the thousand separators the field displays, not just the raw
    // digits, or a value like 1,646.134136 is sized as if it were three chars
    // shorter and overflows on a narrow viewport.
    const amountSizeClass = amountSizeFor(displayedLength(amount))

    function applyFraction(fraction: number) {
        onAmountChange(toAmountString(balance * fraction))
    }

    return (
        <div className="rounded-tile border border-border bg-surface-2 px-4 py-3.5 transition-all focus-within:border-primary/40 focus-within:shadow-swap-input-dark">
            {/* Wraps to a second row on narrow screens rather than squeezing the
                label and balance into fragments. */}
            <div className="mb-2 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-subtle">
                    {isSell ? "You pay" : "You receive"}
                </span>

                {isSell && (
                    <>
                        <span
                            className="ml-auto flex items-center gap-1 whitespace-nowrap text-xs text-muted"
                            translate="no"
                        >
                            <WalletIcon size={13} className="text-subtle" />
                            {formatTokenBalance(balance)} {token.symbol}
                        </span>
                        <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                            {PERCENTS.map((percent) => (
                                <FractionChip
                                    key={percent}
                                    label={`${percent}%`}
                                    disabled={!canUseBalance}
                                    onClick={() => applyFraction(percent / 100)}
                                />
                            ))}
                            <FractionChip
                                label="MAX"
                                emphasis
                                disabled={!canUseBalance}
                                onClick={() => applyFraction(1)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenSelector}
                    aria-label={`Change ${isSell ? "pay" : "receive"} token, currently ${token.name}`}
                    className={cn(
                        "tap-target group flex shrink-0 items-center gap-2 rounded-full py-2 pl-2 pr-3",
                        "border border-border bg-surface-3 transition-colors",
                        "hover:border-primary/50 hover:bg-primary/10"
                    )}
                >
                    <TokenIcon token={token} size={26} />
                    <span className="text-sm font-semibold" translate="no">
                        {token.symbol}
                    </span>
                    <ChevronDownIcon
                        size={14}
                        className="text-subtle transition-colors group-hover:text-primary"
                    />
                </button>

                <div className="min-w-0 flex-1 text-right">
                    {showSkeleton ? (
                        <Skeleton className="ml-auto h-9 w-32" />
                    ) : (
                        <NumericFormat
                            value={amount}
                            onValueChange={(values, sourceInfo) => {
                                // Ignore programmatic value changes; only user typing
                                // should take over as the authoritative side.
                                if (sourceInfo.source === "event") {
                                    onAmountChange(values.value)
                                }
                            }}
                            isAllowed={({ floatValue }) =>
                                floatValue === undefined || floatValue <= Number.MAX_SAFE_INTEGER
                            }
                            thousandSeparator=","
                            thousandsGroupStyle="thousand"
                            decimalScale={AMOUNT_DECIMALS}
                            allowNegative={false}
                            placeholder="0"
                            inputMode="decimal"
                            aria-label={isSell ? "Amount to pay" : "Amount to receive"}
                            className={cn(
                                "min-h-11 w-full bg-transparent text-right font-semibold leading-tight",
                                "tabular-nums outline-none transition-[font-size] placeholder:text-subtle/60",
                                amountSizeClass,
                                !hasPrice && "text-muted"
                            )}
                        />
                    )}

                    <div className="mt-0.5 h-4 text-xs text-subtle" translate="no">
                        {showSkeleton ? (
                            <Skeleton className="ml-auto h-3 w-16" />
                        ) : hasPrice ? (
                            typeof usd === "number" && formatUSDValue(usd)
                        ) : (
                            <span className="text-warning">No price feed</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
