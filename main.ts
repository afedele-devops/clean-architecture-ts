import { buildServer } from "@infrastructure/http/server"

const port = Number(process.env.PORT ?? 3000)  
buildServer().then(app => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}).catch(err => {
    console.error("Error starting server:", err)
})  
