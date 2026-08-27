// Constructed once: these formatters are stateless and reusable, and the token
// list re-formats every visible row on each render.
const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    useGrouping: true,
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
})

const tokenBalanceFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
})

export function formatUSDValue(value: number) {
    return usdFormatter.format(value)
}

// A rate is a ratio, not a balance: token pairs in this list span roughly seven
// orders of magnitude, so a 6-decimal cap would print a real 1.55e-7 rate as "0".
const rateFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    maximumSignificantDigits: 6,
})

export function formatTokenBalance(value: number) {
    return tokenBalanceFormatter.format(value)
}

export function formatRate(value: number) {
    return rateFormatter.format(value)
}

export function removeTrailingZeros(numStr: string) {
    return numStr.includes(".") ? numStr.replace(/\.?0+$/, "") : numStr
}
