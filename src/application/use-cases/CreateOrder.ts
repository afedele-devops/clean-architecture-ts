import { Order } from "@domain/entities/Order";
import { OrderRepository } from "@application/ports/OrderRepository";
import { OrderId } from "@domain/value-objects/OrderId";
import { CustomerId } from "@domain/value-objects/CustomerId";

export type CreateOrderInput = {
    orderId: string;
    customerId: string;
}

export type CreateOrderOutput = {
    orderId: OrderId;
}

export class CreateOrder {
    constructor(private orderRepository: OrderRepository) {}

    async execute({ orderId, customerId }: CreateOrderInput): Promise<CreateOrderOutput> {
        const exist = await this.orderRepository.findById(orderId);
        if (exist) {
            throw new Error("Order already exists");
        }
        const order = new Order(OrderId.create(orderId), CustomerId.create(customerId));
        await this.orderRepository.save(order);
        return { orderId: order.id };
    }
}
