import { CurrencyMismatch, InvalidPrice } from "@domain/errors/DomainError";

export class Price {

    private constructor(readonly amount: number, readonly currency: "EUR" | "USD") {}

    static create(amount: number, currency: "EUR" | "USD"): Price {
        if (!Number.isFinite(amount) || amount < 0) {
            throw new InvalidPrice("Invalid price amount");
        }
        const roundedAmount = Math.round(amount * 100) / 100; // Round to 2 decimal places
        return new Price(roundedAmount, currency);
    }

    add(other: Price): Price {
        if (this.currency !== other.currency) {
            throw new CurrencyMismatch("Cannot add prices with different currencies");
        }
        return Price.create(this.amount + other.amount, this.currency);
    }

    multiply(factor: number): Price {
        if (!Number.isFinite(factor) || factor < 0) {
            throw new InvalidPrice("Invalid multiplication factor");
        }
        return Price.create(this.amount * factor, this.currency);
    }

    equals(other: Price): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }
}
