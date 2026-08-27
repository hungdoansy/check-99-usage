import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import FlipButton from "@/components/swap/FlipButton"
import PriceFeedNotice from "@/components/swap/PriceFeedNotice"
import RateLine from "@/components/swap/RateLine"
import SwapToast, { type SwapReceipt } from "@/components/swap/SwapToast"
import SwapButton from "@/components/swap/SwapButton"
import TokenPanel from "@/components/swap/TokenPanel"
import TokenSelectModal from "@/components/swap/TokenSelectModal"
import { findToken } from "@/constants/tokens"
import { useBalances } from "@/hooks/useBalances"
import { useTokenPrice } from "@/hooks/useTokenPrice"
import { convertAmount, exchangeRate, usdValue } from "@/lib/swap"

const SWAP_SIMULATION_MS = 1600

type Side = "sell" | "buy"

export default function SwapCard() {
    const [sellSymbol, setSellSymbol] = useState("ETH")
    const [buySymbol, setBuySymbol] = useState("USDC")

    /**
     * Only the side the user last typed into is stored. The other side is derived
     * during render, so a price refresh updates it without an effect and without
     * the two fields ever disagreeing.
     */
    const [draft, setDraft] = useState("1")
    const [editedSide, setEditedSide] = useState<Side>("sell")

    const [selectorSide, setSelectorSide] = useState<Side | null>(null)
    const [isSwapping, setIsSwapping] = useState(false)
    const [receipt, setReceipt] = useState<SwapReceipt | null>(null)
    const inFlightRef = useRef(false)
    const settlementTimerRef = useRef<number | undefined>(undefined)

    // The settlement timer mutates balances and releases the in-flight guard, so it
    // must not outlive the card. Harmless while App renders it unconditionally, but
    // the guarantee belongs here rather than in App's shape.
    useEffect(
        () => () => {
            if (settlementTimerRef.current) {
                window.clearTimeout(settlementTimerRef.current)
            }
        },
        []
    )

    const { prices, isInitialLoad, isRefreshing, isUnavailable, isStale, lastUpdatedAt, refresh } =
        useTokenPrice()
    const { balances, applySwap } = useBalances()

    const sellToken = findToken(sellSymbol)
    const buyToken = findToken(buySymbol)
    const sellPrice = prices[sellSymbol]
    const buyPrice = prices[buySymbol]

    const sellAmount = editedSide === "sell" ? draft : convertAmount(draft, buyPrice, sellPrice)
    const buyAmount = editedSide === "buy" ? draft : convertAmount(draft, sellPrice, buyPrice)

    const sellBalance = balances[sellSymbol] ?? 0

    // Stable so the toast's auto-dismiss timer is not torn down and restarted on
    // every price poll.
    const dismissReceipt = useCallback(() => setReceipt(null), [])

    const handleAmountChange = useCallback((side: Side, value: string) => {
        setEditedSide(side)
        setDraft(value)
    }, [])

    const flip = useCallback(() => {
        // Reverse the trade: the amount being received becomes the amount paid.
        setSellSymbol(buySymbol)
        setBuySymbol(sellSymbol)
        setDraft(buyAmount)
        setEditedSide("sell")
    }, [buySymbol, sellSymbol, buyAmount])

    const selectToken = useCallback(
        (side: Side, symbol: string) => {
            const peer = side === "sell" ? buySymbol : sellSymbol

            if (symbol === peer) {
                // Picking the token already on the other side swaps the pair rather
                // than leaving both fields identical. Write the *other* side's
                // current symbol - inside this branch `peer` is the picked symbol,
                // so using it would set both sides to the same token.
                setSellSymbol(side === "sell" ? symbol : buySymbol)
                setBuySymbol(side === "sell" ? sellSymbol : symbol)
            } else if (side === "sell") {
                setSellSymbol(symbol)
            } else {
                setBuySymbol(symbol)
            }

            setSelectorSide(null)
        },
        [buySymbol, sellSymbol]
    )

    const { label, disabled } = useMemo(
        () =>
            resolveCta({
                isSwapping,
                isInitialLoad,
                draft,
                editedSide,
                sellAmount,
                buyAmount,
                sellBalance,
                sellSymbol,
                hasPrices: sellPrice !== undefined && buyPrice !== undefined,
            }),
        [
            isSwapping,
            isInitialLoad,
            draft,
            editedSide,
            sellAmount,
            buyAmount,
            sellBalance,
            sellSymbol,
            sellPrice,
            buyPrice,
        ]
    )

    function handleSubmit() {
        // A ref, not the isSwapping state: two clicks in the same tick would both
        // see the pre-update state and each start a settlement.
        if (disabled || inFlightRef.current) {
            return
        }

        const fromAmount = Number.parseFloat(sellAmount)
        const toAmount = Number.parseFloat(buyAmount)

        inFlightRef.current = true
        setIsSwapping(true)

        settlementTimerRef.current = window.setTimeout(() => {
            settlementTimerRef.current = undefined
            applySwap({ fromSymbol: sellSymbol, toSymbol: buySymbol, fromAmount, toAmount })
            setReceipt({
                from: sellToken,
                to: buyToken,
                fromAmount,
                toAmount,
                // Derived from the two settled amounts, not from `prices`, so the
                // receipt shows the quote that executed even though polling
                // continued during the settlement.
                rate: toAmount / fromAmount,
            })
            setDraft("")
            setEditedSide("sell")
            setIsSwapping(false)
            inFlightRef.current = false
        }, SWAP_SIMULATION_MS)
    }

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
            }}
            className="rounded-card border border-border bg-surface-1 p-3 shadow-card"
        >
            {(isUnavailable || isStale) && (
                <PriceFeedNotice
                    variant={isUnavailable ? "unavailable" : "stale"}
                    isRetrying={isRefreshing}
                    onRetry={refresh}
                />
            )}

            <fieldset disabled={isSwapping} className="contents">
                <TokenPanel
                    variant="sell"
                    token={sellToken}
                    amount={sellAmount}
                    usd={usdValue(sellAmount, sellPrice)}
                    balance={sellBalance}
                    hasPrice={sellPrice !== undefined}
                    showSkeleton={isInitialLoad}
                    onAmountChange={(value) => handleAmountChange("sell", value)}
                    onOpenSelector={() => setSelectorSide("sell")}
                />

                <FlipButton onClick={flip} />

                <TokenPanel
                    variant="buy"
                    token={buyToken}
                    amount={buyAmount}
                    usd={usdValue(buyAmount, buyPrice)}
                    balance={balances[buySymbol] ?? 0}
                    hasPrice={buyPrice !== undefined}
                    showSkeleton={isInitialLoad}
                    onAmountChange={(value) => handleAmountChange("buy", value)}
                    onOpenSelector={() => setSelectorSide("buy")}
                />

                <RateLine
                    sellToken={sellToken}
                    buyToken={buyToken}
                    rate={exchangeRate(sellPrice, buyPrice)}
                    lastUpdatedAt={lastUpdatedAt}
                    isRefreshing={isRefreshing}
                    onRefresh={refresh}
                />

                <SwapButton label={label} disabled={disabled} isSwapping={isSwapping} />
            </fieldset>

            {selectorSide && (
                <TokenSelectModal
                    selectedSymbol={selectorSide === "sell" ? sellSymbol : buySymbol}
                    balances={balances}
                    prices={prices}
                    onSelect={(symbol) => selectToken(selectorSide, symbol)}
                    onClose={() => setSelectorSide(null)}
                />
            )}

            {receipt && <SwapToast receipt={receipt} onClose={dismissReceipt} />}
        </form>
    )
}

/** Maps form state to the CTA's label and enabled-ness (see the plan's CTA state machine). */
function resolveCta({
    isSwapping,
    isInitialLoad,
    draft,
    editedSide,
    sellAmount,
    buyAmount,
    sellBalance,
    sellSymbol,
    hasPrices,
}: {
    isSwapping: boolean
    isInitialLoad: boolean
    draft: string
    editedSide: Side
    sellAmount: string
    buyAmount: string
    sellBalance: number
    sellSymbol: string
    hasPrices: boolean
}): { label: string; disabled: boolean } {
    if (isSwapping) {
        return { label: "Swapping…", disabled: true }
    }

    // A price is undefined both before the first fetch lands and when the feed
    // genuinely carries none. Only the settled case is a failure.
    if (isInitialLoad) {
        return { label: "Fetching prices…", disabled: true }
    }

    if (!hasPrices) {
        return { label: "Price unavailable", disabled: true }
    }

    // "Did the user enter something?" is a question about the side they typed
    // into - the draft. Asking it of the derived side instead would tell someone
    // who just filled the receive field to "enter an amount".
    const draftValue = Number.parseFloat(draft)

    if (!Number.isFinite(draftValue) || draftValue <= 0) {
        return { label: "Enter an amount", disabled: true }
    }

    // The opposite side is derived, and convertAmount returns "" when the result
    // rounds away at display precision. That is a too-small trade, not a blank form.
    const derived = editedSide === "sell" ? buyAmount : sellAmount

    if (derived === "" || !(Number.parseFloat(derived) > 0)) {
        return { label: "Amount too small", disabled: true }
    }

    const sellValue = Number.parseFloat(sellAmount)

    if (!Number.isFinite(sellValue) || sellValue <= 0) {
        return { label: "Enter an amount", disabled: true }
    }

    if (sellValue > sellBalance) {
        return { label: `Insufficient ${sellSymbol} balance`, disabled: true }
    }

    return { label: "Swap", disabled: false }
}
