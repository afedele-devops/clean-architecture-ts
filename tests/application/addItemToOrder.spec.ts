import { describe, it, expect, vi } from "vitest"
import { AddItemToOrder } from "../../src/application/use-cases/AddItemToOrder"
import { Order } from "../../src/domain/entities/Order"
import { OrderId } from "../../src/domain/value-objects/OrderId"
import { CustomerId } from "../../src/domain/value-objects/CustomerId"
import { Price } from "../../src/domain/value-objects/Price"
import { SKU } from "../../src/domain/value-objects/SKU"
import { Quantity } from "../../src/domain/value-objects/Quantity"
import type { OrderRepository } from "../../src/application/ports/OrderRepository"
import type { PricingService } from "../../src/application/ports/PricingService"
import type { EventBus } from "../../src/application/ports/EventBus"
import type { Clock } from "../../src/application/ports/Clock"

// ── helpers ────────────────────────────────────────────────────────────────

function makeOrder(orderId = "order-1", customerId = "c-1") {
    return Order.create(OrderId.create(orderId), CustomerId.create(customerId))
}

function makeDeps(overrides: {
    order?: Order | null
    price?: Price | null
} = {}) {
    const order = overrides.order !== undefined ? overrides.order : makeOrder()

    const repo: OrderRepository = {
        findById: vi.fn().mockResolvedValue(order),
        save: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        findAll: vi.fn().mockResolvedValue([]),
    }

    const price = overrides.price !== undefined
        ? overrides.price
        : Price.create(10, "USD")

    const pricing: PricingService = {
        getCurrentPrice: vi.fn().mockResolvedValue(price),
    }

    const events: EventBus = {
        publish: vi.fn(),
    }

    const clock: Clock = {
        now: vi.fn().mockReturnValue(new Date("2026-01-01T00:00:00Z")),
    }

    return { repo, pricing, events, clock }
}

function makeUseCase(deps = makeDeps()) {
    return new AddItemToOrder(deps.repo, deps.pricing, deps.events, deps.clock)
}

const VALID_INPUT = {
    orderId: "order-1",
    sku: "SKU001",
    qty: 2,
    currency: "USD",
}

// ── happy path ─────────────────────────────────────────────────────────────

describe("AddItemToOrder › happy path", () => {
    it("retorna ok: true", async () => {
        const result = await makeUseCase().execute(VALID_INPUT)

        expect(result.ok).toBe(true)
    })

    it("retorna el orderId en la respuesta", async () => {
        const result = await makeUseCase().execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: true, value: { orderId: "order-1" } })
    })

    it("retorna el amount del total calculado (qty × price)", async () => {
        // qty=2, price=10 → total=20
        const result = await makeUseCase().execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: true, value: { total: { amount: 20 } } })
    })

    it("retorna la moneda correcta en el total", async () => {
        const result = await makeUseCase().execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: true, value: { total: { currency: "USD" } } })
    })

    it("persiste la orden después de agregar el ítem", async () => {
        const deps = makeDeps()
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.repo.save).toHaveBeenCalledOnce()
    })

    it("publica los domain events después de guardar", async () => {
        const deps = makeDeps()
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.events.publish).toHaveBeenCalledOnce()
    })

    it("consulta el precio con el SKU correcto", async () => {
        const deps = makeDeps()
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.pricing.getCurrentPrice).toHaveBeenCalledWith(
            SKU.create(VALID_INPUT.sku),
            VALID_INPUT.currency
        )
    })
})

// ── orden no encontrada ────────────────────────────────────────────────────

describe("AddItemToOrder › orden no encontrada", () => {
    it("retorna ok: false", async () => {
        const result = await makeUseCase(makeDeps({ order: null })).execute(VALID_INPUT)

        expect(result.ok).toBe(false)
    })

    it("retorna error de tipo NotFoundError", async () => {
        const result = await makeUseCase(makeDeps({ order: null })).execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: false, error: { type: "NotFoundError" } })
    })

    it("no llama a save si la orden no existe", async () => {
        const deps = makeDeps({ order: null })
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.repo.save).not.toHaveBeenCalled()
    })

    it("no publica eventos si la orden no existe", async () => {
        const deps = makeDeps({ order: null })
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.events.publish).not.toHaveBeenCalled()
    })
})

// ── precio no disponible ───────────────────────────────────────────────────

describe("AddItemToOrder › precio no disponible", () => {
    it("retorna ok: false", async () => {
        const result = await makeUseCase(makeDeps({ price: null })).execute(VALID_INPUT)

        expect(result.ok).toBe(false)
    })

    it("retorna error de tipo ValidationError", async () => {
        const result = await makeUseCase(makeDeps({ price: null })).execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("el mensaje de error es 'Price not found'", async () => {
        const result = await makeUseCase(makeDeps({ price: null })).execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: false, error: { message: "Price not found" } })
    })

    it("no llama a save si el precio no está disponible", async () => {
        const deps = makeDeps({ price: null })
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.repo.save).not.toHaveBeenCalled()
    })
})

// ── conflicto de moneda ────────────────────────────────────────────────────

describe("AddItemToOrder › conflicto de moneda", () => {
    function makeOrderWithEurItem() {
        const order = makeOrder()
        order.addItem(SKU.create("SKU999"), Quantity.create(1), Price.create(5, "EUR"))
        order.pullDomainEvents() // limpiar eventos previos
        return order
    }

    it("retorna ok: false cuando los ítems existentes usan otra moneda", async () => {
        const deps = makeDeps({ order: makeOrderWithEurItem() })
        // el pricing devuelve USD pero la orden ya tiene EUR
        ;(deps.pricing.getCurrentPrice as ReturnType<typeof vi.fn>).mockResolvedValue(
            Price.create(10, "USD")
        )

        const result = await makeUseCase(deps).execute(VALID_INPUT)

        expect(result.ok).toBe(false)
    })

    it("retorna error de tipo ConflictError ante conflicto de moneda", async () => {
        const deps = makeDeps({ order: makeOrderWithEurItem() })
        ;(deps.pricing.getCurrentPrice as ReturnType<typeof vi.fn>).mockResolvedValue(
            Price.create(10, "USD")
        )

        const result = await makeUseCase(deps).execute(VALID_INPUT)

        expect(result).toMatchObject({ ok: false, error: { type: "ConflictError" } })
    })

    it("no persiste la orden si hay conflicto de moneda", async () => {
        const deps = makeDeps({ order: makeOrderWithEurItem() })
        ;(deps.pricing.getCurrentPrice as ReturnType<typeof vi.fn>).mockResolvedValue(
            Price.create(10, "USD")
        )
        await makeUseCase(deps).execute(VALID_INPUT)

        expect(deps.repo.save).not.toHaveBeenCalled()
    })
})

// ── validación de entrada ──────────────────────────────────────────────────

describe("AddItemToOrder › validación de entrada", () => {
    it("retorna ValidationError cuando orderId está vacío", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, orderId: "" })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("retorna ValidationError cuando el SKU tiene caracteres inválidos", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, sku: "invalid sku!" })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("retorna ValidationError cuando qty es cero", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, qty: 0 })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("retorna ValidationError cuando qty es negativo", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, qty: -1 })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("retorna ValidationError cuando qty es decimal", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, qty: 1.5 })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("retorna ValidationError cuando la moneda no está soportada", async () => {
        const result = await makeUseCase().execute({ ...VALID_INPUT, currency: "GBP" })

        expect(result).toMatchObject({ ok: false, error: { type: "ValidationError" } })
    })

    it("no consulta el repositorio si la validación falla", async () => {
        const deps = makeDeps()
        await makeUseCase(deps).execute({ ...VALID_INPUT, orderId: "" })

        expect(deps.repo.findById).not.toHaveBeenCalled()
    })

    it("no consulta el servicio de precios si la validación falla", async () => {
        const deps = makeDeps()
        await makeUseCase(deps).execute({ ...VALID_INPUT, orderId: "" })

        expect(deps.pricing.getCurrentPrice).not.toHaveBeenCalled()
    })
})
