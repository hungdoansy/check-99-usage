import type { Token } from "@/types/token"

/**
 * The demo's token universe. Names are hand-authored: neither this list nor the
 * prices feed carries one, and the selector searches on name as well as symbol.
 */
export const tokens: Token[] = [
    { id: "BLUR", symbol: "BLUR", name: "Blur", icon: "/icons/tokens/BLUR.svg" },
    { id: "bNEO", symbol: "bNEO", name: "Burger Neo", icon: "/icons/tokens/bNEO.svg" },
    { id: "BUSD", symbol: "BUSD", name: "Binance USD", icon: "/icons/tokens/BUSD.svg" },
    { id: "USD", symbol: "USD", name: "US Dollar", icon: "/icons/tokens/USD.svg" },
    { id: "ETH", symbol: "ETH", name: "Ethereum", icon: "/icons/tokens/ETH.svg" },
    { id: "GMX", symbol: "GMX", name: "GMX", icon: "/icons/tokens/GMX.svg" },
    { id: "LUNA", symbol: "LUNA", name: "Terra Luna", icon: "/icons/tokens/LUNA.svg" },
    { id: "STRD", symbol: "STRD", name: "Stride", icon: "/icons/tokens/STRD.svg" },
    { id: "EVMOS", symbol: "EVMOS", name: "Evmos", icon: "/icons/tokens/EVMOS.svg" },
    { id: "IBCX", symbol: "IBCX", name: "IBC Index", icon: "/icons/tokens/IBCX.svg" },
    { id: "IRIS", symbol: "IRIS", name: "IRISnet", icon: "/icons/tokens/IRIS.svg" },
    { id: "ampLUNA", symbol: "ampLUNA", name: "Amplified Luna", icon: "/icons/tokens/ampLUNA.svg" },
    { id: "KUJI", symbol: "KUJI", name: "Kujira", icon: "/icons/tokens/KUJI.svg" },
    { id: "USDC", symbol: "USDC", name: "USD Coin", icon: "/icons/tokens/USDC.svg" },
    {
        id: "axlUSDC",
        symbol: "axlUSDC",
        name: "Axelar USD Coin",
        icon: "/icons/tokens/axlUSDC.svg",
    },
    { id: "ATOM", symbol: "ATOM", name: "Cosmos", icon: "/icons/tokens/ATOM.svg" },
    { id: "OSMO", symbol: "OSMO", name: "Osmosis", icon: "/icons/tokens/OSMO.svg" },
    { id: "rSWTH", symbol: "rSWTH", name: "Wrapped SWTH", icon: "/icons/tokens/rSWTH.svg" },
    { id: "LSI", symbol: "LSI", name: "Liquid Staking Index", icon: "/icons/tokens/LSI.svg" },
    { id: "OKB", symbol: "OKB", name: "OKB", icon: "/icons/tokens/OKB.svg" },
    { id: "OKT", symbol: "OKT", name: "OKX Chain", icon: "/icons/tokens/OKT.svg" },
    { id: "SWTH", symbol: "SWTH", name: "Switcheo", icon: "/icons/tokens/SWTH.svg" },
    { id: "USC", symbol: "USC", name: "Carbon USD", icon: "/icons/tokens/USC.svg" },
    { id: "WBTC", symbol: "WBTC", name: "Wrapped Bitcoin", icon: "/icons/tokens/WBTC.svg" },
    {
        id: "wstETH",
        symbol: "wstETH",
        name: "Wrapped Staked Ether",
        icon: "/icons/tokens/wstETH.svg",
    },
    { id: "YieldUSD", symbol: "YieldUSD", name: "Yield USD", icon: "/icons/tokens/YieldUSD.svg" },
    { id: "ZIL", symbol: "ZIL", name: "Zilliqa", icon: "/icons/tokens/ZIL.svg" },
]

export function findToken(symbol: string): Token {
    return tokens.find((token) => token.symbol === symbol) ?? tokens[0]
}
