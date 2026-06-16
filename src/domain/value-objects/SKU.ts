export class SKU {
    
    private constructor(public readonly value: string) {
        if (!value || value.trim() === "") {
            throw new Error("SKU cannot be empty")
        }

    }

    static create(value: string): SKU {
        return new SKU(value)
    }

    equals(other: SKU): boolean {
        return this.value === other.value
    }
}

