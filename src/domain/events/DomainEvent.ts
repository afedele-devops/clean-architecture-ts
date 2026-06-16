import { CustomerId } from "@domain/value-objects/CustomerId"
import { OrderId } from "@domain/value-objects/OrderId"
import { Quantity } from "@domain/value-objects/Quantity"
import { Price } from "@domain/value-objects/Price"
import { SKU } from "@domain/value-objects/SKU"

export class DomainEvent {
    public readonly occurredAt: Date

    constructor() {
        this.occurredAt = new Date()
    }
}   

export class OrderItemAdded extends DomainEvent {
    constructor(public readonly orderId: OrderId, public readonly sku: SKU, public readonly qty: Quantity, public readonly unit: Price){
        super()
    }
    type = "order.item.added"
}   

export class OrderCreated extends DomainEvent {
    //new OrderCreated({ orderId: id, customerId: customerId })
    constructor(public readonly orderId: OrderId, public readonly customerId: CustomerId) {
        super()
    }
    type = "order.created"
}

 

