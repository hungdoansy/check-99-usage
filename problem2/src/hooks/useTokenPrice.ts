import { useCallback, useEffect, useRef, useState } from "react"

interface TokenPrice {
    currency: string
    price: number
    date: string
}

type TokenPriceMap = Record<string, number>

const PRICES_API_URL = "https://interview.switcheo.com/prices.json"
export const REFRESH_INTERVAL_MS = 5000
/** Deliberately under the poll cadence so a slow request can never outlive its own interval. */
const REQUEST_TIMEOUT_MS = 4000

export function useTokenPrice() {
    const [prices, setPrices] = useState<TokenPriceMap>({})
    /** True until the first fetch settles, so skeletons show once rather than on every poll. */
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    /** True while any fetch is in flight, so refresh has visible feedback. */
    const [isRefreshing, setIsRefreshing] = useState(true)
    /** Set when the newest fetch failed, whether or not cached prices exist. */
    const [error, setError] = useState<string | null>(null)
    const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)

    const intervalRef = useRef<number | undefined>(undefined)
    /** Requests can overlap; only the newest one is allowed to write state. */
    const requestIdRef = useRef(0)

    const fetchPrices = useCallback(async () => {
        const requestId = ++requestIdRef.current
        const isCurrent = () => requestId === requestIdRef.current

        setIsRefreshing(true)

        try {
            // Without a deadline, a connection that opens but never responds
            // leaves the form on skeletons forever with no error to show.
            const response = await fetch(PRICES_API_URL, {
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            })

            if (!response.ok) {
                throw new Error(`Price feed responded ${response.status}`)
            }

            const data: TokenPrice[] = await response.json()

            // Tokens without a usable price are omitted, so callers can treat a
            // missing key as "no price" rather than checking for zero.
            //
            // The feed carries several rows per currency at different prices, so
            // the newest date wins. Taking whichever row happened to come last
            // would let JSON ordering pick the quote - a ~1% swing on USDC today.
            const newestByCurrency = new Map<string, TokenPrice>()

            for (const entry of data) {
                if (typeof entry.price !== "number" || entry.price <= 0) {
                    continue
                }

                const existing = newestByCurrency.get(entry.currency)

                if (!existing || Date.parse(entry.date) >= Date.parse(existing.date)) {
                    newestByCurrency.set(entry.currency, entry)
                }
            }

            const priceMap: TokenPriceMap = {}

            for (const [currency, entry] of newestByCurrency) {
                priceMap[currency] = entry.price
            }

            if (Object.keys(priceMap).length === 0) {
                // A 200 carrying nothing usable is a feed failure, not an empty
                // truth - otherwise the form looks healthy but can quote nothing.
                throw new Error("Price feed returned no usable prices")
            }

            if (!isCurrent()) {
                return
            }

            setPrices(priceMap)
            setLastUpdatedAt(Date.now())
            setError(null)
        } catch (caught) {
            if (!isCurrent()) {
                return
            }

            setError(caught instanceof Error ? caught.message : "Could not reach the price feed")
        } finally {
            if (isCurrent()) {
                setIsInitialLoad(false)
                setIsRefreshing(false)
            }
        }
    }, [])

    const startPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        intervalRef.current = window.setInterval(fetchPrices, REFRESH_INTERVAL_MS)
    }, [fetchPrices])

    useEffect(() => {
        // Fetching prices on mount is the external-system synchronization this rule
        // exempts: every state write happens after the await, so nothing is set
        // synchronously here.
        // oxlint-disable-next-line react/set-state-in-effect
        fetchPrices()
        startPolling()

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            // Invalidate any in-flight request so it cannot write after unmount.
            requestIdRef.current += 1
        }
    }, [fetchPrices, startPolling])

    const refresh = useCallback(() => {
        fetchPrices()
        startPolling()
    }, [fetchPrices, startPolling])

    const hasPrices = Object.keys(prices).length > 0

    return {
        prices,
        /** Nothing to show yet: first fetch still in flight. */
        isInitialLoad,
        /** A fetch is in flight right now (first load or refresh). */
        isRefreshing,
        /** Hard failure: the feed failed and there is no cached data to fall back on. */
        isUnavailable: error !== null && !hasPrices,
        /** Soft failure: showing cached prices because the newest poll failed. */
        isStale: error !== null && hasPrices,
        error,
        lastUpdatedAt,
        refresh,
    }
}
