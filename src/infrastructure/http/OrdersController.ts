import { FastifyRequest, FastifyReply } from "fastify";
import { createOrder, deleteOrder } from "@composition/container"; // inyectado desde el contenedor de composition root

export const OrdersController = {
    async create(req: FastifyRequest, reply: FastifyReply) {
        const { orderId, customerId } = req.body as any
        const out = await createOrder.execute({ orderId, customerId })
        reply.code(201).send(out)
    },
    
    async delete(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.params as any
        const out = await deleteOrder.execute({ orderId: id })
        reply.code(201).send(out)
    }
}

