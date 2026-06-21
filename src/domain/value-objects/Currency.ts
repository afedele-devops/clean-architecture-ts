export class Currency {
    private constructor(public readonly code: string) {}

    static create(code: string): Currency {
        if (!code || code.length !== 3) {
            throw new Error("Invalid currency code");
        }
        return new Currency(code.toUpperCase());
    }
}   