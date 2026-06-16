export class CustomerId {
    private constructor(public readonly value: string) {}

    static create(value: string): CustomerId {
        // Aquí podrías agregar validaciones, por ejemplo, asegurarte de que el ID no esté vacío
        if (!value) {
            throw new Error("CustomerId cannot be empty")
        }
        return new CustomerId(value)
    }

    equals(other: CustomerId): boolean {
        return this.value === other.value
    }
}