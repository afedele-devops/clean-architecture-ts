import { FastifyRequest, FastifyReply } from "fastify";
import { AddItemToOrder } from "@application/use-cases/AddItemToOrder";
import { CreateOrder } from "@application/use-cases/CreateOrder";
import { AppError } from "@domain/errors/DomainError";

export const makeOrdersController = (addItemToOrder: AddItemToOrder, createOrder: CreateOrder) => ({
    create: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = req.body as any
            const res = await createOrder.execute({
                orderId: body.orderId,
                customerId: body.customerId
            })
            return reply.code(201).send({ orderId: res.orderId.value })
        } catch (e) {
            const err = e as Error
            const status = err.message === "Order already exists" ? 409 : 400
            return reply.code(status).send({ message: err.message })
        }
    },

    addItem: async (req: FastifyRequest, reply: FastifyReply) => {
        const body = req.body as any
        const res = await addItemToOrder.execute({
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

