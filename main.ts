import { buildContainer } from "@composition/container"
import { buildServer } from "@infrastructure/http/server"

async function main() {
    const c = buildContainer()
    const app = await buildServer(c) // inyectamos el contenedor en el servidor
    const port = Number(c.config.PORT)
    await app.listen({port})

    c.ports.eventBus && c.config.USE_IN_MEMORY === "false" && console.log("Outbox ready")
    const shutdown = async(signal: string) => {
        c.logger.info(`Received ${signal}, shutting down...`)
        await app.close()
        if(c.pool) { await c.pool.end() }
        process.exit(0)
    }

    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
