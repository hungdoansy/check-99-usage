import SwapCard from "@/components/swap/SwapCard"

export default function App() {
    return (
        <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
            {/* Layered page ground: a lime glow behind the card, and a faint grid
                that fades out before it reaches the edges. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
                <div className="absolute bottom-[-20rem] left-[-10rem] h-[32rem] w-[32rem] rounded-full bg-accent/6 blur-[130px]" />
                <div
                    className="absolute inset-0 opacity-[0.25]"
                    style={{
                        // Tracks the border-strong token rather than repeating its
                        // literal value, so the grid cannot drift from the palette.
                        ["--grid-line" as string]:
                            "color-mix(in hsl, var(--color-border-strong) 35%, transparent)",
                        backgroundImage:
                            "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                        maskImage:
                            "radial-gradient(ellipse 70% 55% at 50% 40%, black 20%, transparent 75%)",
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-[460px]">
                <header className="mb-5 flex items-baseline justify-between px-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Swap</h1>
                    <p className="text-xs text-subtle">Live prices, simulated settlement</p>
                </header>

                <SwapCard />
            </div>
        </main>
    )
}
