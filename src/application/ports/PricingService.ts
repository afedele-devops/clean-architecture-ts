import { Price } from "@domain/value-objects/Price";
import { SKU } from "@domain/value-objects/SKU";

export interface PricingService {
    getCurrentPrice(sku: SKU, currency: string): Promise<Price>;
}   
