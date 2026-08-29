import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

export async function ListarLogs(req: Request, res: Response) {
    try {
        const listar = await prisma.log.findMany({
            include: {
                cliente: { select: { nome: true } },
                vendedor: { select: { nome: true } },
                admin: { select: { nome: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar logs." })
        return
    }
}