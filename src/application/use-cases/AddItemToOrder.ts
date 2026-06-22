import { AddItemToOrderOutput, AddItemToOrderInput } from "@application/dtos/AddItemToOrderDTO";
import { ConflictError, CurrencyMismatch, ValidationError, NotFoundError, AppError } from "@domain/errors/DomainError";
import { Quantity } from "@domain/value-objects/Quantity";
import { SKU } from "@domain/value-objects/SKU";
import { Result, ok, fail } from "@shared/result";
import { Currency } from "@domain/value-objects/Currency";
import { AppContext } from "@application/context";

export function makeAddItemToOrder(ctx: AppContext) {
    return {

    async execute(input: AddItemToOrderInput): Promise<Result<AddItemToOrderOutput, AppError>> {
        const v = this.validate(input);
        if(!v.ok){ 
            return v;
        }

        const order = await ctx.orders.findById(input.orderId);
        if(!order){
            const err: NotFoundError = new NotFoundError("Order", input.orderId);
            return fail(err);
        }

        const sku = SKU.create(input.sku);
        const qty = Quantity.create(input.qty);
        const currency = Currency.create(input.currency);
        const price = await ctx.pricing.getCurrentPrice(sku, currency);

        if(!price){
            const err: ValidationError = new ValidationError("Price not found");
            return fail(err);
        }

        try {
            order.addItem(sku, qty, price);
            await ctx.orders.save(order);
            
            const events = order.pullDomainEvents();
            await ctx.events.publish(events);
            
            const total = order.total(); 
            return ok({ orderId: order.id.value, total: { amount: total.amount, currency: total.currency } });
        }catch(e){
            if(e instanceof CurrencyMismatch){
                const err: ConflictError = new ConflictError("Currency mismatch error");
                return fail(err);
            }
            const err: ValidationError = new ValidationError((e as Error).message);
            return fail(err);
        }
    
    },

    validate(input: AddItemToOrderInput): Result<AddItemToOrderInput, ValidationError> {
        const errors: Record<string, string> = {};
        if(!input.orderId){
            errors.orderId = "orderId is required";
        }
        if(!/^[A-Z0-9]{3,30}$/.test(input.sku)){
            errors.sku = "SKU is invalid";
        }
        if(!Number.isInteger(input.qty) || input.qty <= 0){
            errors.qty = "Quantity must be a positive integer";
        }
        if(!["USD", "EUR"].includes(input.currency)){
            errors.currency = "Currency is unsupported";
        }
        
        return Object.keys(errors).length
            ? fail(new ValidationError("Invalid input", errors ))
            : ok(input);
    }
}

}

export type AddItemToOrder = ReturnType<typeof makeAddItemToOrder>