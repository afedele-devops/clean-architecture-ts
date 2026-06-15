export class Price {

    private constructor(readonly amount: number, readonly currency: "EUR" | "USD") {}

    static create(amount: number, currency: "EUR" | "USD"): Price {
        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error("Invalid price amount");
        }
        const roundedAmount = Math.round(amount * 100) / 100; // Round to 2 decimal places
        return new Price(roundedAmount, currency);
    }
}