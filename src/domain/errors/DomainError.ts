export class DomainError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DomainError"
    }
}

export class CurrencyMismatch extends DomainError {
    constructor(message: string) {
        super(message)
        this.name = "CurrencyMismatch"
    }       
}

export class InvalidPrice extends DomainError {
    constructor(message: string) {
        super(message)
        this.name = "InvalidPrice"
    }       
}



