import { removeTrailingZeros } from "@/lib/format"

/** Display precision for amounts. Matches the input's decimalScale. */
export const AMOUNT_DECIMALS = 6

type Price = number | undefined

/**
 * Converts an amount between two tokens via their USD prices.
 *
 * Returns "" for anything that cannot produce a meaningful counter-amount: a
 * blank or zero input, a token the feed carries no price for, or a result that
 * rounds away to nothing at display precision. Callers render "" as an empty
 * field rather than a zero, so an unpriced token reads as "unknown", not "free".
 */
export function convertAmount(amount: string, fromPrice: Price, toPrice: Price): string {
    const value = Number.parseFloat(amount)

    if (!Number.isFinite(value) || value <= 0) {
        return ""
    }

    if (!isUsablePrice(fromPrice) || !isUsablePrice(toPrice)) {
        return ""
    }

    const converted = (value * fromPrice) / toPrice

    if (!Number.isFinite(converted) || converted <= 0) {
        return ""
    }

    // toFixed switches to exponential notation at 1e21, which the amount field
    // renders as a nonsense figure. An inexpressible counter-amount reads as
    // unknown instead, the same as an unpriced token.
    if (converted >= 1e21) {
        return ""
    }

    const fixed = removeTrailingZeros(converted.toFixed(AMOUNT_DECIMALS))

    return Number.parseFloat(fixed) > 0 ? fixed : ""
}

/** How many `to` tokens one `from` token buys, or undefined if either lacks a price. */
export function exchangeRate(fromPrice: Price, toPrice: Price): number | undefined {
    if (!isUsablePrice(fromPrice) || !isUsablePrice(toPrice)) {
        return undefined
    }

    return fromPrice / toPrice
}

/** USD value of an amount, or undefined when the amount or price is unusable. */
export function usdValue(amount: string, price: Price): number | undefined {
    const value = Number.parseFloat(amount)

    if (!Number.isFinite(value) || !isUsablePrice(price)) {
        return undefined
    }

    return value * price
}

/**
 * Formats a balance-derived amount for an input field.
 *
 * Truncates rather than rounds: this feeds MAX and the percentage chips, and a
 * balance whose float tail is ...99999 would round *up* past the balance itself,
 * leaving the CTA stuck on "Insufficient balance" for a spend the user is
 * entitled to. Losing up to 1e-6 of a token is the better trade.
 *
 * A dust balance that truncates away returns "" rather than "0", matching
 * convertAmount: a chip on a near-empty balance leaves the field blank instead
 * of filling in a deliberate-looking zero.
 */
export function toAmountString(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
        return ""
    }

    const scale = 10 ** AMOUNT_DECIMALS
    const truncated = Math.floor(value * scale) / scale
    const fixed = removeTrailingZeros(truncated.toFixed(AMOUNT_DECIMALS))

    return Number.parseFloat(fixed) > 0 ? fixed : ""
}

function isUsablePrice(price: Price): price is number {
    return typeof price === "number" && Number.isFinite(price) && price > 0
}
