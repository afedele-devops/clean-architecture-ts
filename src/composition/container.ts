import { loadConfig} from "./config"
import { InMemoryOrderRepository } from "@infrastructure/persistence/in-memory/InMemoryOrderRepository"
import { PostgresOrderRepository } from "@infrastructure/persistence/postgres/PostgresOrderRepository"
import { HttpPricingService } from "@infrastructure/http/HttpPricingService"
import { makeAddItemToOrder } from "@application/use-cases/AddItemToOrder"
import { PinoLogger } from "@infrastructure/messaging/PinoLogger"
import { OutboxEventBus } from "@infrastructure/messaging/OutboxEventBus"
import { Pool } from "pg"
import { CreateOrder } from "@application/use-cases/CreateOrder"


export function buildContainer() {
    const config = loadConfig()
    const logger = new PinoLogger()
    
    const pool = config.USE_IN_MEMORY === "true" 
        ? null 
        : new Pool({ connectionString: config.DATABASE_URL})  

    const orderRepo = config.USE_IN_MEMORY === "true"
        ? new InMemoryOrderRepository()
        : new PostgresOrderRepository(pool!)
        
    const pricingService = new HttpPricingService(config.PRICING_BASE_URL)
    const eventBus = config.USE_IN_MEMORY === "true"
        ? { publish: async () => {} } // dummy event bus for in-memory mode 
        : new OutboxEventBus(pool!)
    const clock = { now: () => new Date() }

    // casos de uso
    const createOrder = new CreateOrder(orderRepo, eventBus)
    const addItemToOrder = makeAddItemToOrder({ orders: orderRepo, pricing: pricingService, events: eventBus, clock })   
    return {
        config, logger, pool,
        ports:{ orderRepo, pricingService, eventBus, clock },
        useCases: { createOrder, addItemToOrder }
    }
}

export type AppContainer = ReturnType<typeof buildContainer>