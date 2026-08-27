# Token Swap Interface

A currency swap form built with React, TypeScript and Vite. Prices come from a
live feed; balances and settlement are simulated, so nothing here touches a
wallet or a chain.

## Getting Started

### Prerequisites

- Node >= 22.13
- pnpm ^11 (the `packageManager` field pins the exact version)

### Installation

```bash
pnpm install
```

Then start the dev server:

```bash
pnpm dev
```

and open [http://localhost:5120](http://localhost:5120).

### Scripts

| Command                           | What it does                               |
| --------------------------------- | ------------------------------------------ |
| `pnpm dev`                        | Dev server on port 5120                    |
| `pnpm build`                      | Typecheck (`tsc -b`) then production build |
| `pnpm preview`                    | Serve the built output                     |
| `pnpm lint` / `pnpm lint:fix`     | oxlint                                     |
| `pnpm format` / `pnpm format:fix` | oxfmt                                      |

## Tech Stack

- React 19 and TypeScript, bundled by Vite 8 (Rolldown)
- Tailwind CSS 4, configured in CSS via `@theme` in `src/index.css` - one
  dark palette, with the scrollbars themed to match it
- oxlint and oxfmt in place of ESLint and Prettier
- `react-number-format` for the amount fields; Inter shipped locally as a variable font

TypeScript is held at 6.0.x deliberately: `typescript-eslint`-era tooling and
several type-aware plugins still declare `typescript <6.1.0`, so TypeScript 7 is
an install conflict rather than an upgrade.

## Behaviour

### Prices

Fetched from `https://interview.switcheo.com/prices.json` and re-polled every 5
seconds. The refresh control doubles as a countdown ring to the next poll, so
values never change without a visible cause. Tokens the feed omits are treated as
having no price rather than a price of zero.

Two failure states are distinguished:

- **no data at all** - an alert with a Retry action; amounts cannot be quoted
- **stale data** - the last known prices stay on screen with a quieter notice

### Amounts

Both fields are editable. Only the side last typed into is stored; the other is
derived during render, so a price refresh can never leave the two disagreeing.
The pay side offers 25/50/75% and MAX. Flip reverses the trade - the amount being
received becomes the amount paid.

### Validation

The primary button is the validation surface. It reads `Fetching prices…`,
`Enter an amount`, `Insufficient <token> balance`, `Price unavailable` or
`Amount too small`, and only says `Swap` when the form can actually be submitted.

### Choosing a token

Search matches either symbol or name, so "osmo" finds ATOM. Tokens the wallet
holds sort first and by value, with the rest alphabetical behind them. Arrow keys
move the highlight, Enter takes it, and picking the token already on the other
side swaps the pair rather than pointing both fields at one token.

### Swapping

Submitting runs a ~1.6s simulated settlement, then a toast slides in at the
bottom right with both legs and the rate that was executed. A draining line
makes its 7s auto-dismiss predictable; it can also be dismissed early. Mock
balances move, so MAX and the balance check stay consistent afterwards. Nothing
is persisted - a reload restores the seed balances.

### Motion

The token dialog and the toast each animate in and out, staying mounted until the
exit animation has actually played, so neither vanishes mid-frame. Under
`prefers-reduced-motion` every duration collapses to near zero.

### Accessibility

The token picker is a native `<dialog>`, so focus trapping, Esc and an inert
background come from the platform. The confirmation deliberately is not one: it
is an `<output>` with `aria-live="polite"`, announcing itself without pulling
focus off the form. The token list is arrow-key navigable, rate changes are
announced via `aria-live`, amount fields use `inputmode="decimal"`, every control
clears a 44x44 hit area, and no state is signalled by colour alone.

## Project Structure

```
src/
├── components/
│   ├── icons.tsx            # inline SVG icon set (no icon dependency)
│   ├── swap/                # card, panels, token dialog, rate, CTA, toast
│   └── ui/                  # dialog shell, token icon, skeleton
├── constants/               # mock balances and the token list
├── hooks/                   # price polling, mock balance state
├── lib/                     # swap math, formatting, class merging
└── types/
```
