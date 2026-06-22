import type {AppContainer} from "@composition/container"

export type RequestScope = ReturnType<typeof makeRequestScope>

export function makeRequestScope(c: AppContainer) {
    // Instancias por peticion (transient scope) Ej. un tracer con un requestId unico por peticion
       requestId: crypto.randomUUID()   
    }
export type AppRequest = { scope: RequestScope }