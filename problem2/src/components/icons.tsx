import type { SVGProps } from "react"

/**
 * Hand-rolled inline icons. The app carries no icon dependency, and the previous
 * markup referenced an `iconify` class with no iconify runtime loaded, so those
 * glyphs never rendered at all.
 *
 * Every icon inherits `currentColor` and sizes from the `size` prop.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {children}
        </svg>
    )
}

export function ChevronDownIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m6 9 6 6 6-6" />
        </Icon>
    )
}

export function SearchIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </Icon>
    )
}

export function CloseIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M18 6 6 18M6 6l12 12" />
        </Icon>
    )
}

export function SwapVerticalIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M7 4v16M7 20l-3.5-3.5M7 20l3.5-3.5" />
            <path d="M17 20V4M17 4l-3.5 3.5M17 4l3.5 3.5" />
        </Icon>
    )
}

export function RefreshIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M20 11a8 8 0 1 0-2.3 5.7" />
            <path d="M20 4v7h-7" />
        </Icon>
    )
}

export function WalletIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <rect x="2.5" y="6" width="19" height="13" rx="3" />
            <path d="M2.5 10h19" />
            <circle cx="17" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
        </Icon>
    )
}

export function CheckIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="m4.5 12.5 5 5 10-11" />
        </Icon>
    )
}

export function WarningIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M12 3.5 2.5 20h19L12 3.5Z" />
            <path d="M12 10v4.5" />
            <circle cx="12" cy="17.4" r="0.9" fill="currentColor" stroke="none" />
        </Icon>
    )
}

export function ArrowRightIcon(props: IconProps) {
    return (
        <Icon {...props}>
            <path d="M4 12h16M14 6l6 6-6 6" />
        </Icon>
    )
}
