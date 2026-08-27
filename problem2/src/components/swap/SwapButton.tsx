import { cn } from "@/lib/utils"

/**
 * The CTA is also the validation surface: when the form cannot be submitted the
 * reason replaces the label, which is the convention these swap forms use
 * instead of a separate inline error.
 */
export default function SwapButton({
    label,
    disabled,
    isSwapping,
}: {
    label: string
    disabled: boolean
    isSwapping: boolean
}) {
    return (
        // Submission is owned by the form's onSubmit. Adding an onClick here too
        // would run the handler twice per click.
        <button
            type="submit"
            disabled={disabled}
            className={cn(
                "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full",
                "text-base font-semibold transition-all duration-200",
                // Each state names its own colours. Using a `disabled:` variant for
                // the blocked look would outrank these by specificity (class plus
                // pseudo-class) and grey out the swapping state too, since the
                // button is disabled while it works.
                isSwapping
                    ? // Busy, not blocked: keep the brand fill so it reads as work
                      // in progress rather than a dead form.
                      "bg-primary/85 text-on-primary"
                    : disabled
                      ? "bg-surface-3 text-muted"
                      : "bg-primary text-on-primary hover:brightness-110 active:scale-[0.99]"
            )}
        >
            {isSwapping && (
                // border-current so the spinner tracks the label colour in whatever
                // state the button is in, instead of being a fixed dark ring that
                // can land on a dark fill.
                <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
            )}
            {label}
        </button>
    )
}
