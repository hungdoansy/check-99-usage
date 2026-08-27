import { SwapVerticalIcon } from "@/components/icons"

/**
 * Sits on the seam between the two panels, cut out of the page ground by a thick
 * background-coloured border.
 */
export default function FlipButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="relative z-10 -my-3.5 flex justify-center">
            <button
                type="button"
                onClick={onClick}
                aria-label="Reverse the trade direction"
                className="group flex size-11 items-center justify-center rounded-full border-4 border-surface-1 bg-surface-3 text-muted transition-all duration-200 hover:bg-primary hover:text-on-primary active:scale-95"
            >
                <SwapVerticalIcon size={17} />
            </button>
        </div>
    )
}
