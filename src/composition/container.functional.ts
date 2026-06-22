import { buildAdapters } from "@composition/factories"

export function buildContext() {
    const { orders, pricing, events, clock } = buildAdapters()
    return { orders, pricing, events, clock }     
}