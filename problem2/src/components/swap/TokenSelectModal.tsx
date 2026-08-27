import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

import ModalShell from "@/components/ui/ModalShell"
import TokenIcon from "@/components/ui/TokenIcon"
import { CheckIcon, CloseIcon, SearchIcon } from "@/components/icons"
import { tokens } from "@/constants/tokens"
import { formatTokenBalance, formatUSDValue } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

/** Kept in step with the modal-out keyframes in index.css. */
const EXIT_MS = 180

export default function TokenSelectModal({
    selectedSymbol,
    balances,
    prices,
    onSelect,
    onClose,
}: {
    selectedSymbol: string
    balances: Record<string, number>
    prices: Record<string, number>
    onSelect: (symbol: string) => void
    onClose: () => void
}) {
    const [query, setQuery] = useState("")
    /**
     * The highlight is stored with the query it belongs to, so a narrowing search
     * resets it during render instead of through an effect.
     */
    const [highlight, setHighlight] = useState({ query: "", index: 0 })

    /**
     * The dialog stays mounted while it animates out. Every way of leaving -
     * Esc, backdrop, the close button, picking a token - sets this instead of
     * unmounting, so none of them can cut the animation short.
     */
    const [isLeaving, setIsLeaving] = useState(false)
    /** Set when the exit was started by choosing a token, applied once it finishes. */
    const pendingSymbolRef = useRef<string | null>(null)

    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const titleId = useId()

    const results = useMemo(() => rankTokens(query, balances, prices), [query, balances, prices])

    const activeIndex =
        highlight.query === query ? Math.min(highlight.index, Math.max(0, results.length - 1)) : 0

    const beginExit = useCallback((symbol?: string) => {
        pendingSymbolRef.current = symbol ?? null
        setIsLeaving(true)
    }, [])

    useEffect(() => {
        searchRef.current?.focus()
    }, [])

    /**
     * Held in a ref so the exit timer below depends only on `isLeaving`. The
     * parent passes inline callbacks, so depending on them directly would cancel
     * and restart the timer on every parent re-render - a price poll mid-exit
     * would delay the selection, and a busier parent could stall it entirely.
     */
    const finishExitRef = useRef<() => void>(() => {})

    useEffect(() => {
        finishExitRef.current = () => {
            const symbol = pendingSymbolRef.current
            if (symbol === null) {
                onClose()
            } else {
                onSelect(symbol)
            }
        }
    }, [onClose, onSelect])

    useEffect(() => {
        if (!isLeaving) {
            return
        }

        const timer = window.setTimeout(() => finishExitRef.current(), EXIT_MS)

        return () => window.clearTimeout(timer)
    }, [isLeaving])

    // Keep the highlighted row in view while navigating by keyboard.
    useEffect(() => {
        const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
        row?.scrollIntoView({ block: "nearest" })
    }, [activeIndex])

    function moveHighlight(delta: number) {
        if (results.length === 0) {
            return
        }
        setHighlight({
            query,
            index: (activeIndex + delta + results.length) % results.length,
        })
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (isLeaving) {
            return
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            moveHighlight(event.key === "ArrowDown" ? 1 : -1)
            return
        }

        if (event.key === "Enter") {
            // Only the search field's Enter means "take the highlighted row". A row
            // reached by Tab must activate itself; intercepting here would cancel
            // its native activation and select the highlighted row instead, which
            // is not the one the user is looking at.
            if (event.target !== searchRef.current) {
                return
            }

            event.preventDefault()
            const target = results[activeIndex]
            if (target) {
                beginExit(target.symbol)
            }
        }
    }

    return (
        <ModalShell
            labelledBy={titleId}
            onClose={beginExit}
            onKeyDown={handleKeyDown}
            closeOnBackdropClick
            className={cn(
                "flex max-h-[85dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-card",
                isLeaving
                    ? "animate-[modal-out_180ms_ease-in_forwards] backdrop:animate-[backdrop-out_180ms_ease-in_forwards]"
                    : "animate-[modal-in_220ms_cubic-bezier(0.22,1,0.36,1)] backdrop:animate-[backdrop-in_220ms_ease-out]",
                // Ignore further clicks once it is on the way out.
                isLeaving && "pointer-events-none"
            )}
        >
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
                <h2 id={titleId} className="text-base font-semibold">
                    Select a token
                </h2>
                <button
                    type="button"
                    onClick={() => beginExit()}
                    aria-label="Close token list"
                    className="tap-target -mr-2 flex items-center justify-center rounded-full text-subtle transition-colors hover:text-foreground"
                >
                    <CloseIcon size={18} />
                </button>
            </div>

            <div className="px-5 pb-3">
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 transition-colors focus-within:border-primary/50">
                    <SearchIcon size={16} className="shrink-0 text-subtle" />
                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name or symbol"
                        aria-label="Search tokens by name or symbol"
                        className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-subtle/70"
                    />
                </div>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
                {results.length === 0 ? (
                    <p className="px-3 py-10 text-center text-sm text-subtle">
                        No token matches “{query}”.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-0.5">
                        {results.map((token, index) => {
                            const balance = balances[token.symbol] ?? 0
                            const price = prices[token.symbol]
                            const isSelected = token.symbol === selectedSymbol

                            return (
                                <li key={token.id}>
                                    <button
                                        type="button"
                                        data-index={index}
                                        onClick={() => beginExit(token.symbol)}
                                        onMouseEnter={() => setHighlight({ query, index })}
                                        aria-current={isSelected}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                                            isSelected && "bg-primary/10",
                                            !isSelected && index === activeIndex && "bg-surface-3",
                                            // An outline rather than another
                                            // background: on the selected row two
                                            // background utilities would collapse
                                            // into one and the highlight would
                                            // vanish exactly where it matters.
                                            index === activeIndex &&
                                                "outline outline-1 -outline-offset-1 outline-primary/40"
                                        )}
                                    >
                                        <TokenIcon token={token} size={32} dimmed={balance === 0} />
                                        <span className="min-w-0 flex-1">
                                            <span
                                                className="flex items-center gap-1.5 text-sm font-semibold"
                                                translate="no"
                                            >
                                                {token.symbol}
                                                {isSelected && (
                                                    <CheckIcon size={13} className="text-primary" />
                                                )}
                                            </span>
                                            <span className="block truncate text-xs text-subtle">
                                                {token.name}
                                                {price === undefined && " · no price feed"}
                                            </span>
                                        </span>
                                        <span
                                            className={cn(
                                                "shrink-0 text-right",
                                                balance === 0 && "opacity-45"
                                            )}
                                            translate="no"
                                        >
                                            <span className="block text-sm tabular-nums">
                                                {formatTokenBalance(balance)}
                                            </span>
                                            {price !== undefined && balance > 0 && (
                                                <span className="block text-xs tabular-nums text-subtle">
                                                    {formatUSDValue(balance * price)}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </ModalShell>
    )
}

/**
 * Filters by symbol or name, then puts tokens the wallet actually holds first
 * (most valuable first), with the rest alphabetical behind them.
 */
function rankTokens(
    query: string,
    balances: Record<string, number>,
    prices: Record<string, number>
): Token[] {
    const needle = query.trim().toLowerCase()

    const matches = needle
        ? tokens.filter(
              (token) =>
                  token.symbol.toLowerCase().includes(needle) ||
                  token.name.toLowerCase().includes(needle)
          )
        : tokens

    return matches.toSorted((a, b) => {
        const aHeld = (balances[a.symbol] ?? 0) > 0
        const bHeld = (balances[b.symbol] ?? 0) > 0

        if (aHeld !== bHeld) {
            return aHeld ? -1 : 1
        }

        if (aHeld && bHeld) {
            const aValue = (balances[a.symbol] ?? 0) * (prices[a.symbol] ?? 0)
            const bValue = (balances[b.symbol] ?? 0) * (prices[b.symbol] ?? 0)
            if (aValue !== bValue) {
                return bValue - aValue
            }
        }

        return a.symbol.localeCompare(b.symbol)
    })
}
