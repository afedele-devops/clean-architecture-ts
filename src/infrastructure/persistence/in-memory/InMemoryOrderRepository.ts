import { OrderRepository } from "@application/ports/OrderRepository"
import { Order } from "@domain/entities/Order"

export class InMemoryOrderRepository implements OrderRepository {
    private store = new Map<string, Order>();

    async findById(id: string) {
        return this.store.get(id) ??  null;
    }

    async findAll(): Promise<Order[]> {
        return Array.from(this.store.values());
    }

    async save(order: Order){
        this.store.set(order.id.value, order);
    }

    async delete(id: string) {
        this.store.delete(id);
    }
}