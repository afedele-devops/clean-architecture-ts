import { CustomerId } from "@domain/value-objects/CustomerId"
import { OrderId } from "@domain/value-objects/OrderId"
import { Quantity } from "@domain/value-objects/Quantity"
import { Price } from "@domain/value-objects/Price"
import { SKU } from "@domain/value-objects/SKU"

export class DomainEvent {
    public readonly occurredAt: Date
    public readonly type: string = ""
    public readonly payload: Record<string, unknown> = {}

    constructor( type?: string, payload?: Record<string, unknown>) {
        this.occurredAt = new Date()
        if (type) {
            this.type = type
        }
        if (payload) {
            this.payload = payload
        }
    }
}   

export class OrderItemAdded extends DomainEvent {
    
    constructor(public readonly orderId: OrderId, public readonly sku: SKU, public readonly qty: Quantity, public readonly unit: Price){
        const type = "order.item.added"
        const payload = {
            orderId: orderId.value,
            sku: sku.value,
            qty: qty.value,
            unit: {
                amount: unit.amount,
                currency: unit.currency,
            }
        }
        super(type, payload)
    }
}   

export class OrderCreated extends DomainEvent {
    //new OrderCreated({ orderId: id, customerId: customerId })

    constructor(public readonly orderId: OrderId, public readonly customerId: CustomerId) {
        const type = "order.created"
        const payload = {
            orderId: orderId.value,
            customerId: customerId.value
        }
        super(type, payload)
    }
}

 

