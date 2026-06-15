import { OrderRepository } from "@application/ports/OrderRepository"

export class DeleteOrder {
    constructor(private orderRepository: OrderRepository) {}

    async execute({ orderId }: { orderId: string }): Promise<void> {
        await this.orderRepository.delete(orderId)
    }
}
