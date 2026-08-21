import type { Request, Response } from "express"
import { prisma } from "../../lib/prisma.js"

export async function ListarTenno(req: Request, res: Response) {
    try {
        const listar = await prisma.tenno.findMany({
            orderBy: { nickname: 'asc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar tenno." })
        return
    }
}

export async function CriarTenno(req: Request, res: Response) {
    try {
        const { nickname, email } = req.body

        if (!nickname || !email) {
            res.status(400).json({ error: "Nickname e email são obrigatórios." })
            return
        }

        const criar = await prisma.tenno.create({
            data: { nickname, email }
        })

        res.status(201).json(criar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao cadastrar tenno." })
        return
    }
}

export async function PesquisarTenno(req: Request, res: Response) {
    try {
        const { nickname } = req.query

        if (!nickname || typeof nickname !== 'string') {
            res.status(400).json({ error: "Parametro de pesquisa inválido." })
            return
        }

        const resultados = await prisma.tenno.findMany({
            where: { nickname: { contains: nickname } }
        })

        res.status(200).json(resultados)
    } catch (error) {
        res.status(400).json({ error: "Falha ao realizar a pesquisa." })
        return
    }
}

export async function RecarregarSaldo(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { platina, credito } = req.body

        if (!id) {
            res.status(404).json({ error: "ID Inválido." })
            return
        }

        if (!platina && !credito) {
            res.status(400).json({ error: "Informe ao menos um valor para recarregar." })
            return
        }

        const tenno = await prisma.tenno.findUnique({ where: { idTenno: Number(id) } })

        if (!tenno) {
            res.status(404).json({ error: "Tenno não encontrado." })
            return
        }

        const atualizar = await prisma.tenno.update({
            where: { idTenno: Number(id) },
            data: {
                saldoPlatinas: tenno.saldoPlatinas + (Number(platina) || 0),
                saldoCreditos: tenno.saldoCreditos + (Number(credito) || 0)
            }
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao recarregar saldo." })
        return
    }
}