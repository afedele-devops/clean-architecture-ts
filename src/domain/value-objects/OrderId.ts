export class OrderId {
    private constructor(private readonly value: string) {}

    static create(value: string): OrderId {
        // Aquí podrías agregar validaciones para el formato del ID, longitud, etc.
        return new OrderId(value)
    }

    equals(other: OrderId): boolean {
        return this.value === other.value
    }
}   