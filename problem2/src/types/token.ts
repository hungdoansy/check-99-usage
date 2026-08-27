export interface Token {
    id: string
    symbol: string
    /** Human-readable name, so the selector can be searched by more than ticker. */
    name: string
    icon: string
}
