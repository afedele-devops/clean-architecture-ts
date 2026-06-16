import {describe, it, expect} from "vitest"
import { Price } from "../../src/domain/value-objects/Price"

describe("Price", () => {
    it("no permite negativos y redondea a 2 decimales", () => {
        expect(() => Price.create(-1, "EUR")).toThrow("Invalid price amount")
        const price = Price.create(1.2345, "USD")
        expect(price.amount).toBe(1.23)
    })
})


