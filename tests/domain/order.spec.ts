import { Order } from "../../src/domain/entities/Order"
import { OrderId } from "../../src/domain/value-objects/OrderId"
import { CustomerId} from "../../src/domain/value-objects/CustomerId"
import { Price } from "../../src/domain/value-objects/Price"
import { Quantity } from "../../src/domain/value-objects/Quantity"
import { SKU } from "../../src/domain/value-objects/SKU" 
import { describe, it, expect } from "vitest"

it("acumula total con misma moneda y emite eventos", () => {
    const order = Order.create(OrderId.create("o-1"), CustomerId.create("c-1"))
    order.addItem(SKU.create("sku-1"), Quantity.create(2), Price.create(10, "USD"))
    order.addItem(SKU.create("sku-2"), Quantity.create(1), Price.create(5, "USD"))

    const events = order.pullDomainEvents()
    expect(order.total().amount).toBe(25)
    expect(events.length).toBe(3)
    expect(events.some(e => e.type === "order.created")).toBeTruthy()
    expect(events.some(e => e.type === "order.item.added")).toBeTruthy()
})