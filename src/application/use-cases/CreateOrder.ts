import { Order } from "@domain/entities/Order";
import { OrderRepository } from "@application/ports/OrderRepository";

export type CreateOrderInput = {
    orderId: string;
    customerId: string;
}

export type CreateOrderOutput = {
    orderId: string;
}

export class CreateOrder {
    constructor(private orderRepository: OrderRepository) {}

    async execute({ orderId, customerId }: CreateOrderInput): Promise<CreateOrderOutput> {
        const exist = await this.orderRepository.findById(orderId);
        if (exist) {
            throw new Error("Order already exists");
        }
        const order = new Order(orderId, customerId)
        await this.orderRepository.save(order);
        return { orderId: order.id };
    }
}
