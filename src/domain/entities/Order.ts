import { Price } from "@domain/value-objects/Price";
import { SKU } from "@domain/value-objects/SKU";
import { Quantity } from "@domain/value-objects/Quantity";
import { OrderId } from "@domain/value-objects/OrderId";
import { CustomerId } from "@domain/value-objects/CustomerId";
import { DomainEvent, OrderCreated, OrderItemAdded } from "@domain/events/DomainEvent";
import { CurrencyMismatch } from "@domain/errors/DomainError";

type OrderItem = Readonly<{
    sku: SKU;
    qty: Quantity;
    unit: Price;
}>

export class Order {    
    private readonly items: OrderItem[] = []
    private readonly domainEvents: DomainEvent[] = []

    constructor(readonly id: OrderId, readonly customerId: CustomerId) { }

    static create(id: OrderId, customerId: CustomerId): Order {
        const order = new Order(id, customerId)
        order.record(new OrderCreated(id, customerId ))
        return order
    }
    
    addItem(sku: SKU, qty: Quantity, unit: Price) {
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            if (firstItem && unit.currency !== firstItem.unit.currency) {
                throw new CurrencyMismatch("All items in the order must have the same currency")   
            }
        }
        this.items.push(Object.freeze({ sku, qty, unit }))
        this.record(new OrderItemAdded(this.id, sku, qty, unit ))

    }

    total(): Price {
        if (this.items.length === 0) {
            return Price.create(0, "EUR") //convención: si no hay items, el total es 0 EUR, aunque podría ser 0 USD o cualquier otra moneda, pero hay que elegir una por convención 
        }
    
        const currency = this.items[0]!.unit.currency
        return this.items.reduce((acc, i) => acc.add(i.unit.multiply(i.qty.value)),
         Price.create(0, currency))
    }

    pullDomainEvents(): DomainEvent[] {
        const events = [...this.domainEvents];
        (this as any).domainEvents = [] //limpiar el array de eventos después de "tirarlos"
        return events
    }

    private record(e: DomainEvent) { this.domainEvents.push(e)}
}