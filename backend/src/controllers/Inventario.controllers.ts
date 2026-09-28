import type { Response } from "express"
import { prisma } from "../../lib/prisma.js"
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js"

export async function ListarInventarioCliente(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        // só o próprio cliente ou um admin pode ver o inventário
        // (antes só CLIENTE era barrado, então um VENDEDOR passava)
        if (req.tipo !== "ADMIN" && req.userId !== Number(id)) {
            res.status(403).json({ error: "Acesso negado." })
            return
        }

        const inventario = await prisma.inventario.findMany({
            where: { id_cliente: Number(id) },
            include: { item: { include: { categoria: true } } },
            orderBy: { data: 'desc' }
        })

        res.status(200).json(inventario)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar inventário." })
        return
    }
}
