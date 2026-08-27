import { useCallback, useState } from "react"

import { balances as initialBalances } from "@/constants/balance"

/**
 * Mock wallet balances held in state so a simulated swap can move them.
 *
 * Without this, MAX and the insufficient-balance check would keep quoting the
 * original numbers after a swap "settled", which reads as broken. Nothing is
 * persisted: a reload restores the seed values.
 */
export function useBalances() {
    const [balances, setBalances] = useState<Record<string, number>>(() => ({
        ...initialBalances,
    }))

    const applySwap = useCallback(
        ({
            fromSymbol,
            toSymbol,
            fromAmount,
            toAmount,
        }: {
            fromSymbol: string
            toSymbol: string
            fromAmount: number
            toAmount: number
        }) => {
            setBalances((current) => {
                // A same-symbol trade is not a trade. Guarding here matters because
                // the two legs below would otherwise be duplicate keys in one
                // object literal: the credit would overwrite the debit and the
                // balance would grow out of nothing.
                if (fromSymbol === toSymbol) {
                    return current
                }

                const next = { ...current }
                next[fromSymbol] = Math.max(0, (next[fromSymbol] ?? 0) - fromAmount)
                next[toSymbol] = (next[toSymbol] ?? 0) + toAmount

                return next
            })
        },
        []
    )

    return { balances, applySwap }
}
