import { Order } from "@domain/entities/Order";
import { Pool } from "pg";

export class PostgresOrderRepository {

    constructor(pool: Pool) {}

    // Aquí iría la configuración de la conexión a PostgreSQL, por ejemplo usando pg o TypeORM.
    // Para este ejemplo, vamos a simular la persistencia con un Map en memoria.
    private store: Map<string, Order> = new Map();
    
    async findById(id: string): Promise<Order | null> {
        return this.store.get(id) || null;
    }

    async findAll(): Promise<Order[]> {
        return Array.from(this.store.values());
    }

    async save(order: Order): Promise<void> {
        this.store.set(order.id.value, order);
    }

    async delete(id: string): Promise<void> {
        this.store.delete(id);
    }
}   