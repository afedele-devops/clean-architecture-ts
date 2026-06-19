# Clean Architecture con TypeScript

Proyecto de referencia que implementa **Clean Architecture** con TypeScript y Fastify. Modela un dominio de órdenes de compra aplicando principios de DDD: Aggregate Root, Value Objects, Domain Events y puertos/adaptadores.

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| TypeScript | ^6.0 | Lenguaje principal |
| Fastify | ^4.23 | Servidor HTTP |
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
│   │   ├── use-cases/
│   │   │   ├── CreateOrder.ts
│   │   │   └── DeleteOrder.ts
│   │   └── ports/
│   │       └── OrderRepository.ts   # Interfaz (puerto de salida)
│   └── infrastructure/              # Adaptadores y frameworks
│       ├── persistence/
│       │   └── InMemoryOrderRepository.ts
│       ├── http/
│       │   ├── server.ts            # Configuración Fastify
│       │   └── OrdersController.ts
│       └── composition/
│           └── container.ts         # Composition Root (DI manual)
└── tests/
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

- **`CreateOrder`** — Verifica que la orden no exista y la persiste.
- **`DeleteOrder`** — Elimina una orden por ID.
- **`OrderRepository`** — Interfaz (puerto) que define el contrato de persistencia.

### Infrastructure
Implementa los detalles técnicos: HTTP y persistencia.

- **`InMemoryOrderRepository`** — Implementación en memoria del puerto `OrderRepository`.
- **`server.ts`** — Instancia Fastify y registra las rutas.
- **`OrdersController`** — Maneja las peticiones HTTP delegando a los casos de uso.
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
- **Aggregate Root**: `Order` es el único punto de entrada para modificar el agregado.
- **Value Objects inmutables**: construidos con factories estáticas que validan invariantes.
- **Domain Events**: `Order` registra eventos internamente; se extraen con `pullDomainEvents()`.
- **Composition Root único**: el cableado de dependencias ocurre exclusivamente en `container.ts`.

