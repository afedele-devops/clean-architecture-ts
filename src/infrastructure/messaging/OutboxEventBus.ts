import {EventBus} from "@application/ports/EventBus";
import {DomainEvent} from "@domain/events/DomainEvent";
import {randomUUID} from "crypto"

type Queryable = { query:(q: string, params?: any[]) => Promise<unknown>;}

export class OutboxEventBus implements EventBus {
    constructor(private readonly db: Queryable) {}

    async publish(events: DomainEvent[]): Promise<void> {
        const query = "INSERT INTO outbox (id, type, payload, occurred_at, published_at) VALUES ($1, $2, $3, $4, null)";
        for (const e of events) {
            await this.db.query(query, [
                randomUUID(),
                e.type,
                JSON.stringify(e.payload),
                e.occurredAt.toISOString()
            ]);
        }
    }
}   