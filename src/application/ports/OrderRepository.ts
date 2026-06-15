import { Order } from "@domain/entities/Order"

export interface OrderRepository {
    save(order: Order): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
}

