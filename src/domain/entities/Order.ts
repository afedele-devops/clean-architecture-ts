export class Order {
     constructor(orderId: string, customerId: string) {
        this.id = orderId;
        this.customerId = customerId;
     }
     id: string;
     customerId: string;
}
