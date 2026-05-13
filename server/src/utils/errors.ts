export class AppError extends Error {
    public statuscode: number

    constructor(statuscode: number, message: string) {
        super(message)
        this.statuscode = statuscode
    }
}

export class UnauthorizedError extends AppError {
    constructor() {
        super(401, "Unauthorized")
    }
}

export class NotFoundError extends AppError {
    constructor() {
        super(404, "Not Found")
    }
}

export class ValidationError extends AppError {
    constructor() {
        super(422, "Validation Error")
    }
}

export class ConflictError extends AppError {
    constructor() {
        super(409, "Conflict")
    }
}