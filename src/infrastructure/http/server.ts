
import Fastify from "fastify"
import { makeOrdersController } from "@infrastructure/http/OrdersController"
import { AppContainer } from "@composition/container"

export async function buildServer(c: AppContainer) {
    const app = Fastify()
    const ctrl = makeOrdersController(c.useCases.addItemToOrder, c.useCases.createOrder )
   
    app.post("/orders", ctrl.create)
    app.post("/orders/:orderId/items", ctrl.addItem)
   
    return app
}


