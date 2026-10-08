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
import interacaoRouter from "./routers/Interacao.routers.js"
import dashboardRouter from "./routers/Dashboard.routers.js"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json({ limit: "3mb" })) // fotos dos itens vão como texto (base64)
app.use(cors())

// rota simples para o Render checar se o servidor está de pé
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/auth", authRouter)
app.use("/clientes", clienteRouter)
app.use("/vendedores", vendedorRouter)
app.use("/admins", adminRouter)
app.use("/categorias", categoriaRouter)
app.use("/itens", itemRouter)
app.use("/loja", lojaRouter)
app.use("/compras", compraRouter)
app.use("/logs", logRouter)
app.use("/interacoes", interacaoRouter)
app.use("/dashboard", dashboardRouter)

app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada." })
})

app.listen(port, () => {
    console.log(`rodando na port:${port}`)
})