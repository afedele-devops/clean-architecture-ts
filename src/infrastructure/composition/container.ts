import { InMemoryOrderRepository } from "@infrastructure/persistence/in-memory/InMemoryOrderRepository"
import { PostgresOrderRepository } from "@infrastructure/persistence/postgres/PostgresOrderRepository"
import { HttpPricingService } from "@infrastructure/http/HttpPricingService"
import { AddItemToOrder } from "@application/use-cases/AddItemToOrder"
import { PinoLogger } from "@infrastructure/messaging/PinoLogger"
import { OutboxEventBus } from "@infrastructure/messaging/OutboxEventBus"
import { Pool } from "pg"

const env = process.env
const pool = new Pool({
    connectionString: env.DATABASE_URL
})

const orderRepo = env.USE_IN_MEMORY_REPO === "true"
    ? new InMemoryOrderRepository()
    : new PostgresOrderRepository(pool)

const pricingService = new HttpPricingService(env.PRICING_BASE_URL ?? "http://localhost:4000")
const eventBus = new OutboxEventBus(pool)
const logger = new PinoLogger()

export const addItemToOrder = new AddItemToOrder(orderRepo, pricingService, eventBus, {now: () => new Date()})  