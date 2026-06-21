import { pino } from "pino"
import { Logger } from "@application/ports/Logger"

export class PinoLogger implements Logger {
    private logger = pino()

    log(message: string): void {
        this.logger.info(message)
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(meta ?? {}, message)
    }

    error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(meta ?? {}, message)
    }
}
