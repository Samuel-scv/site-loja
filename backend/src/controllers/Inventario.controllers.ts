import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

export async function ListarInventarioTenno(req: Request, res: Response) {
    try {
        const { id } = req.params

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        const inventario = await prisma.inventario.findMany({
            where: { idTenno: Number(id) },
            include: { item: true },
            orderBy: { dataAquisicao: 'desc' }
        })

        res.status(200).json(inventario)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar inventário." })
        return
    }
}