import type { OrderRepository } from "@application/ports/OrderRepository"
import type { PricingService } from "@application/ports/PricingService"
import type { EventBus } from "@application/ports/EventBus"
import type { Clock } from "@application/ports/Clock"

export type AppContext = {
    orders: OrderRepository
    pricing: PricingService
    events: EventBus
    clock: Clock
};
