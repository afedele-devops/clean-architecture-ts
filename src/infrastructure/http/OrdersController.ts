import { FastifyRequest, FastifyReply } from "fastify";
//import { addItemToOrder, createOrder, deleteOrder } from "@composition/container"; // inyectado desde el contenedor de composition root

import { AddItemToOrder } from "@application/use-cases/AddItemToOrder";
import { AppError } from "@domain/errors/DomainError";


export const makeOrdersController = (uc: AddItemToOrder) => ({
    addItem: async (req: FastifyRequest, reply: FastifyReply) => {
        const body = req.body as any
        const res = await uc.execute({
            orderId: (req.params as any)["orderId"] as string,
            sku: body.sku,
            qty: body.qty,
            currency: body.currency
        })
        if(!res.ok){    
            const {status, body} = mapAppErrorToHttp(res.error)
            return reply.code(status).send(body)
        }
        reply.code(200).send(res.value)
    }
})

function mapAppErrorToHttp(e: AppError): { status: any; body: any; } {
    switch (e.type) {
        case "ValidationError":
            return { status: 400, body: e };
        case "NotFoundError":
            return { status: 404, body: e };
        case "ConflictError":
            return { status: 409, body: e };
        default:
            return { status: 503, body: e };
    }
}

