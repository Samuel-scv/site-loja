import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { prisma } from "../../lib/prisma.js"

export async function ListarUsuario(req: Request, res: Response) {
    try {
        const listar = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                cargo: true,
                nivelAcesso: true,
                criado_em: true
            }
        })

        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar usuario." })
        return
    }
}

export async function CriarUsuario(req: Request, res: Response) {
    try {
        const { nome, email, senha, nivelAcesso } = req.body

        if (!nome || !email || !senha || !nivelAcesso) {
            res.status(400).json({ error: "Todos os dados sao obrigatórios." })
            return
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const criar = await prisma.usuario.create({
            data: {
                nome, email, senhaHash, nivelAcesso
            },
            select: {
                id: true,
                nome: true,
                email: true,
                cargo: true,
                nivelAcesso: true
            }
        })

        res.status(201).json({ mensagem: "Usuario criado: ", criar })
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao criar usuario." })
        return
    }
}