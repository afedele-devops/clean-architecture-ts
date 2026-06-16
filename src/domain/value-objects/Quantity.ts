export class Quantity {
    private constructor(readonly value: number) {
        if (value <= 0) {
            throw new Error("Quantity must be greater than zero")
        }
    }

    static create(value: number): Quantity {
        return new Quantity(value)
    }

    equals(other: Quantity): boolean {
        return this.value === other.value
    }   
}   