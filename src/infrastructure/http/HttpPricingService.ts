import { PricingService } from "@application/ports/PricingService";
import { Currency } from "@domain/value-objects/Currency";
import { Price } from "@domain/value-objects/Price";
import { SKU } from "@domain/value-objects/SKU";

export class HttpPricingService  implements PricingService {
    constructor(private baseUrl: string) {
        // Aquí podrías configurar la URL base del servicio de precios, autenticación, etc.
    }
    getCurrentPrice(sku: SKU, currency: Currency): Promise<Price | null> {
        // Aquí harías una llamada HTTP real a un servicio externo para obtener el precio.
        // Para este ejemplo, vamos a simularlo con un precio fijo.
        const price = Price.create(100, "USD");
        return Promise.resolve(price);
    }
}       

