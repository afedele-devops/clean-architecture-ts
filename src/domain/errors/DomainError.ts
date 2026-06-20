export class DomainError extends Error {
    type: string
    constructor(message: string, public details?: Record<string, string>) {
        super(message)
        this.type = "DomainError"
        this.details = details;
    }
}

export class CurrencyMismatch extends DomainError {
    constructor(message: string) {
        super(message)
        this.type = "CurrencyMismatch"
    }       
}

export class InvalidPrice extends DomainError {
    constructor(message: string) {
        super(message)
        this.type = "InvalidPrice"
    }       
}

export class ValidationError extends DomainError {
    constructor(message: string, public details?: Record<string, string>) {
        super(message, details)
        this.type = "ValidationError"
    }       
}

export class ConflictError extends DomainError {
    constructor(message: string) {
        super(message)
        this.type = "ConflictError"
    }       
}

export class NotFoundError extends DomainError {
    resource: string;
    id: string;
    constructor(resource: string, id: string) {
        super(`${resource} with id ${id} not found`)
        this.type = "NotFoundError"
        this.resource = resource;
        this.id = id;
    }       
}

export type AppError = ValidationError | ConflictError | NotFoundError;
