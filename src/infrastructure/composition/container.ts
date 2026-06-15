import { InMemoryOrderRepository } from "@infrastructure/persistence/InMemoryOrderRepository"
import { CreateOrder } from "@application/use-cases/CreateOrder"
import { DeleteOrder } from "@application/use-cases/DeleteOrder"

const orderRepository = new InMemoryOrderRepository()
export const createOrder = new CreateOrder(orderRepository)
export const deleteOrder = new DeleteOrder(orderRepository)

