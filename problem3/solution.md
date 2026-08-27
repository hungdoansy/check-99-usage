# Problem 3

## Issues and Anti-patterns

1. Duplication of types in `FormattedWalletBalance`
   Problem: `currency: string` and `amount: number` are repeated in `FormattedWalletBalance`, even though it extends `WalletBalance`.
   Impact: Redundant code increases maintainability.
   Fix: Remove the duplicated fields from `FormattedWalletBalance` since they’re already inherited from `WalletBalance`.

2. Non-descriptive rest props variable
   Problem: The component destructures `props` into `{ children, ...rest }`, and `rest` variable is used in JSX.
   Impact: The name `rest` is generic and may reduce clarity in more complex components.
   Fix: Rename rest to otherProps for semantic clarity and inline the destructuring.

3. Missing type annotation for prices
   Problem: prices from usePrices() is used without an explicit type.
   Impact: Reduces type safety and can lead to unclear or unsafe access patterns (e.g., prices[balance.currency]).
   Fix: Add a type annotation, e.g.:

4. Unnecessary inline function definition for getPriority
   Problem: `getPriority` is defined inside the component, but it does not rely on any props, state, or hooks.
   Impact: Re-declaring the same function on every render increases memory usage.
   Fix: Move `getPriority` outside the component to avoid redefinition and improve readability.

5. Incorrect use of `useMemo`
   Problem: `useMemo` depends on balances and prices, but only balances is used. prices is unnecessary in the dependency array.
   Impact: Misleading dependencies can lead to unnecessary recalculations or missed updates.
   Fix: Remove prices from the dependency array.

6. Implicit any types
   Problem: `getPriority(blockchain: any)` uses any.
   Impact: Ambiguous type definition.
   Fix: Define a union of supported blockchain strings.

7. Wrong Type Assumptions in `getPriority`
   Problem: `getPriority` assumes input is a blockchain, but WalletBalance interface has no such field.
   Impact: TypeScript will not catch this if any is used; it also indicates tight coupling or mismatched assumptions.
   Fix: Either add blockchain to WalletBalance, or revise the logic to match the correct input type.

8. Missing type annotation for balances
   Problem: The type WalletBalance is repeatedly asserted or inferred in multiple places where balances is used.
   Impact: Leads to verbose and potentially inconsistent typing across the component.
   Fix: Explicitly type balances as WalletBalance[] when calling useWalletBalances() to ensure consistent type usage:

9. Logic Bug – Undefined Variable
   Problem: `lhsPriority` is used but never declared.
   Impact: Runtime error.
   Fix: Use the correct variable, likely `balancePriority`; or remove the if condition.

10. Incorrect use of `.map()` without key stability
    Problem: Using `index` as key in `WalletRow`.
    Impact: Poor list diffing performance and potential rendering bugs when items are reordered or inserted.
    Fix: Use a stable key like currency.

11. Double Mapping Over sortedBalances
    Problem: sortedBalances is mapped twice: once for formatting, and once for rendering.
    Impact: Redundant operations; `formattedBalances` is created but never used.
    Fix: Combine mapping and formatting in one pass or reuse `formattedBalances`.

12. Missing currency to usdValue Fallback
    Problem: `prices[balance.currency] * balance.amount` assumes all prices exist.
    Impact: Potential `NaN` rendering if `price` is undefined.
    Fix: Add a fallback (`prices[balance.currency] ?? 0`); or check type of `prices[balance.currency]` before calculation

13. Missing classes definition
    Problem: classes.row is used in the WalletRow component, but classes is not defined or imported anywhere in the code.
    Impact: Results in a runtime error (ReferenceError: classes is not defined) and breaks styling.
    Fix: Define or import classes appropriately, or remove the className prop if not needed:

14. Inverted filter condition
    Problem: The filter returns `true` when `balance.amount <= 0`, so it keeps only zero and negative balances.
    Impact: The wallet displays empty balances and hides every asset that the user has.
    Fix: Change the condition to `balance.amount > 0`

15. Rows render `sortedBalances` instead of `formattedBalances`
    Problem: `formattedBalances` is built but `rows` maps over `sortedBalances`, whose items have no `formatted` field.
    Impact: `formattedAmount` is `undefined` on every row, so the amount column renders blank.
    Fix: Map over the formatted array

16. Type annotation hides the bug in item 16
    Problem: The callback is annotated `(balance: FormattedWalletBalance)` but `sortedBalances` is `WalletBalance[]`.
    Impact: TypeScript checks callback params, showing no errors on compilation. This is certainly an incorrect annotation - it lies about the source type. Without this issue, the item 16 would have been caught.
    Fix: Remove the annotation and let Typescript compiler infer.

17. Sort comparator can be simplified
    Problem: The comparator returns `-1` or `1` but falls through to `undefined` when prioritizes are equal. It happens because Zilliqa and Neo both return 20.
    Impact: 

18. `toFixed()` is called with no argument
    Problem: `balance.amount.toFixed()` defaults to 0 decimal places.
    Impact: Small fractional token amounts get erased. For example, `0.5 ETH` renders as `1`, and `0.4 ETH` renders as `0`.
    Fix: Pass an explicit precision as the argument, for example: 4 or 6. Or another approach is to use `Intl.NumberFormat` with min/max fractional digits.

19. `getPriority` called `O(n log n)` times
    Problem: `getPriority` is invoked inside the comparator, so it runs on every comparison, and again in `filter` for the same elements.
    Impact: Redundant computation. It can be reduced to `O(n)`.
    Fix: Calculate priority once per element like `balances.map(balance => ({ balance, priority: getPriority(balance.blockchain) })).filter().sort().map(({ balance }) => balance)`

20. Switch-case instead of a simple lookup map
    Problem: `getPriority` uses a switch over string literals.
    Impact: `O(k)` per call, and adding a new chain requires updating the control flow rather than the data.
    Fix: Use `Record<Blockchain, number>` with `?? -99` to fallback. This is `O(1)` and data-driven.

21. `children` destructured but never rendered
    Problem: `children` is pulled out of props, which removes it from `rest`, and then dropped.
    Impact: Any children passed to `WalletPage` silently disappear.
    Fix: Render `{children}` inside the wrapper, or stop destructuring it so it stays in the spread.

22. `WalletRow` never gets `currency`
    Problem: The row gets `amount`, `usdValue`, and `formattedAmount`, but no currency identifier.
    Impact: The row cannot label which asset it shows, so the list is just unreadable.
    Fix: Pass `currency` as a prop.

23. Redundant double annotation on the component
    Problem: `React.FC<Props> = (props: Props)` - `Props` is written twice.
    Impact: Noise, and they can drift apart and `React.FC` is discouraged in the current React typings.
    Fix: Remove `React.FC<Props>`

24. In-place mutation via `.sort()`
    Problem: `.sort()` mutates its caller - this is anti-pattern. It's safe here only because `.filter()` returns a fresh array reference.
    Impact: low. if `.filter()` is removed, this silent mutation can corrupt the state.
    Fix: Use `.toSorted()` - it doesn't mutate the caller.

## Refactored version

```tsx
import { useMemo } from "react"

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo"

interface WalletBalance {
    currency: string
    amount: number
    blockchain: Blockchain
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string
}

type WalletPageProps = BoxProps

const DEFAULT_PRIORITY = -99

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20
}

const getPriority = (blockchain: Blockchain): number => {
    return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY
}

const amountFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
})

const classes = {
    row: ""
}

const WalletPage = ({ children, ...otherProps }: WalletPageProps) => {
    const balances: WalletBalance[] = useWalletBalances()
    const prices: Record<string, number> = usePrices()

    const displayBalances = useMemo<FormattedWalletBalance[]>(() => {
        return balances
            .map(balance => ({
                balance,
                priority: getPriority(balance.blockchain)
            }))
            .filter(({ balance, priority }) => {
                return priority > DEFAULT_PRIORITY && balance.amount > 0
            })
            .toSorted((a, b) => b.priority - a.priority)
            .map(({ balance }) => {
                ...balance,
                formatted: amountFormatter.format(balance.amount)
            })
    }, [balances])

    const rows = displayBalances.map(balance => {
        const price = prices[balance.currency]
        const usdValue = price === undefined ? undefined : price * balance.amount

        return (
            <WalletRow
                key={`${balance.blockchain}-${balance.currency}`}
                className={classes.row}
                currency={balance.currency}
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={balance.formatted}
            />
        )
    })

    return <div {...otherProps}>
        {rows}
        {children}
    </div>
}
```
