# Clean Architecture con TypeScript

Proyecto de referencia que implementa **Clean Architecture** con TypeScript y Fastify. Modela un dominio de órdenes de compra aplicando principios de DDD: Aggregate Root, Value Objects, Domain Events y puertos/adaptadores.

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| TypeScript | ^6.0 | Lenguaje principal |
| Fastify | ^4.23 | Servidor HTTP |
| pg | ^8.22 | Cliente PostgreSQL |
| @types/pg | ^8.20 | Tipado para pg |
| Vitest | ^4.1 | Tests unitarios |
| tsx | ^3.14 | Ejecución en desarrollo |
| tsconfig-paths | ^4.2 | Path aliases |

---

## Estructura de carpetas

```
.
├── main.ts                          # Entry point
├── src/
│   ├── domain/                      # Núcleo del negocio (sin dependencias externas)
│   │   ├── entities/
│   │   │   └── Order.ts             # Aggregate Root
│   │   ├── value-objects/
|   |   |   ├── Currency.ts
│   │   │   ├── Price.ts             # Valor monetario con validación y aritmética
│   │   │   ├── Quantity.ts
│   │   │   ├── SKU.ts
│   │   │   ├── OrderId.ts
│   │   │   └── CustomerId.ts
│   │   ├── events/
│   │   │   └── DomainEvent.ts       # OrderCreated, OrderItemAdded
│   │   └── errors/
│   │       └── DomainError.ts       # CurrencyMismatch, InvalidPrice
│   ├── application/                 # Casos de uso y puertos
│   │   ├── dtos/
│   │   │   └── AddItemToOrderDTO.ts
│   │   ├── use-cases/
│   │   │   └── AddItemToOrder.ts   
│   │   └── ports/
│   │       ├── Clock.ts
│   │       ├── EventBus.ts
│   │       ├── PricingService.ts
│   │       └── OrderRepository.ts   # Interfaz (puerto de salida)
│   ├── infrastructure/              # Adaptadores y frameworks
│   |    ├── messaging/
│   |    │   ├── OutboxEventBus.ts
│   |    │   └── PinoLogger.ts
│   |    ├── persistence/
│   |    │   ├── in-memory/
|   |    |   |   └──InMemoryOrderRepository.ts
│   |    |   └── postgres/
│   |    │       └── PostgresOrderRepository.ts
│   |    ├── http/
|   |    |   ├── HttpPricingService.ts 
│   |    │   ├── server.ts            # Configuración Fastify
│   |    │   └── OrdersController.ts
│   |    └── composition/
│   |        └── container.ts         # Composition Root (DI manual)
|   └──shared/
|      ├── health.ts
|      └── result.ts
└── tests/
  ├── application/
  │   └── addItemToOrder.spec.ts
  └── domain/
    ├── order.spec.ts
    └── price.spec.ts
```

---

## Capas de la arquitectura

### Domain
Contiene toda la lógica de negocio. No depende de ninguna capa externa.

- **`Order`** — Aggregate Root que gestiona ítems, calcula el total y emite Domain Events. Valida que todos los ítems tengan la misma moneda.
- **Value Objects** — Objetos inmutables con validación en construcción (`Price`, `SKU`, `Quantity`, `OrderId`, `CustomerId`).
- **Domain Events** — `OrderCreated` y `OrderItemAdded` son emitidos por la entidad y recogidos con `pullDomainEvents()`.
- **Domain Errors** — Jerarquía tipada: `DomainError` → `CurrencyMismatch`, `InvalidPrice`.

### Application
Orquesta los casos de uso sin conocer detalles de infraestructura.

- **`AddItemToOrder`** — Valida la entrada, consulta el precio actual, agrega el ítem, persiste la orden y publica eventos de dominio.
- **DTOs y puertos** — `AddItemToOrderDTO`, `Clock`, `EventBus` y `PricingService` separan el caso de uso de sus dependencias externas.
- **`OrderRepository`** — Interfaz (puerto) que define el contrato de persistencia.

### Infrastructure
Implementa los detalles técnicos: HTTP y persistencia.

- **`InMemoryOrderRepository`** — Implementación en memoria del puerto `OrderRepository`.
- **`PostgresOrderRepository`** — Adaptador preparado para PostgreSQL usando `pg`.
- **`server.ts`** — Instancia Fastify y registra las rutas.
- **`OrdersController`** — Maneja las peticiones HTTP delegando a los casos de uso.
- **`OutboxEventBus`** y **`PinoLogger`** — Soporte para publicación de eventos y logging.
- **`container.ts`** — Composition Root: cablea dependencias manualmente (sin framework de DI).

---

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/orders` | Crea una orden nueva |
| `DELETE` | `/orders/:id` | Elimina una orden por ID |

### POST /orders

**Body:**
```json
{
  "orderId": "order-123",
  "customerId": "customer-456"
}
```

**Response `201`:**
```json
{
  "orderId": "order-123"
}
```

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Ejecutar tests
npm test
```

El servidor arranca por defecto en el puerto `3000`. Se puede cambiar con la variable de entorno `PORT`.

---

## Path aliases

Configurados en `tsconfig.json` y registrados en tiempo de ejecución con `tsconfig-paths`:

| Alias | Apunta a |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@shared/*` | `src/shared/*` |
| `@composition/*` | `src/infrastructure/composition/*` |

---

## Principios aplicados

- **Dependency Rule**: las capas internas no conocen las externas.
- **Ports & Adapters**: `OrderRepository` es un puerto; `InMemoryOrderRepository` es el adaptador.
- **Adaptadores múltiples**: la persistencia puede resolverse con memoria o PostgreSQL sin cambiar el caso de uso.
- **Aggregate Root**: `Order` es el único punto de entrada para modificar el agregado.
- **Value Objects inmutables**: construidos con factories estáticas que validan invariantes.
- **Domain Events**: `Order` registra eventos internamente; se extraen con `pullDomainEvents()`.
- **Composition Root único**: el cableado de dependencias ocurre exclusivamente en `container.ts`.

