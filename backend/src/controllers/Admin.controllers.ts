import type { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { prisma } from "../../lib/prisma.js"

export async function CriarAdmin(req: Request, res: Response) {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            res.status(400).json({ error: "Nome, email e senha são obrigatórios." })
            return
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const criar = await prisma.admin.create({
            data: { nome, email, senha: senhaHash },
            select: { id: true, nome: true, email: true }
        })

        res.status(201).json({ mensagem: "Admin cadastrado: ", criar })
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha ao cadastrar admin." })
        return
    }
}

export async function ListarAdmins(req: Request, res: Response) {
    try {
        const listar = await prisma.admin.findMany({
            select: { id: true, nome: true, email: true, ultimoLogin: true },
            orderBy: { nome: 'asc' }
        })
        res.status(200).json(listar)
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar admins." })
        return
    }
}