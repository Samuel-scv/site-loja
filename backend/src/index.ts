import "dotenv/config"
import express from "express"
import cors from "cors"

import authRouter from "./routers/Auth.routers.js"
import clienteRouter from "./routers/Cliente.routers.js"
import vendedorRouter from "./routers/Vendedor.routers.js"
import adminRouter from "./routers/Admin.routers.js"
import categoriaRouter from "./routers/Categoria.routers.js"
import itemRouter from "./routers/Item.routers.js"
import lojaRouter from "./routers/Loja.routers.js"
import compraRouter from "./routers/Compra.routers.js"
import logRouter from "./routers/Log.routers.js"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use("/auth", authRouter)
app.use("/clientes", clienteRouter)
app.use("/vendedores", vendedorRouter)
app.use("/admins", adminRouter)
app.use("/categorias", categoriaRouter)
app.use("/itens", itemRouter)
app.use("/loja", lojaRouter)
app.use("/compras", compraRouter)
app.use("/logs", logRouter)

app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada." })
})

app.listen(port, () => {
    console.log(`rodando na port:${port}`)
})