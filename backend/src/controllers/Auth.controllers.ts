import type { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../../lib/prisma.js";
import type { Tipo } from "../middlewares/AuthMiddlewares.js"

export async function Login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body
        if (!email || !senha) {
            res.status(400).json({ error: "Email e senha obrigatórios." })
            return
        }

        // não existe mais uma tabela única "usuario" com cargo, então
        // procuramos o email nas três tabelas até encontrar
        let usuario: { id: number, nome: string, senha: string } | null = null
        let tipo: Tipo | null = null

        const cliente = await prisma.cliente.findUnique({ where: { email } })
        if (cliente) {
            usuario = cliente
            tipo = "CLIENTE"
        }

        if (!usuario) {
            const vendedor = await prisma.vendedor.findUnique({ where: { email } })
            if (vendedor) {
                usuario = vendedor
                tipo = "VENDEDOR"
            }
        }

        if (!usuario) {
            const admin = await prisma.admin.findUnique({ where: { email } })
            if (admin) {
                usuario = admin
                tipo = "ADMIN"
            }
        }

        if (!usuario || !tipo || !(await bcrypt.compare(senha, usuario.senha))) {
            res.status(400).json({ error: "Email ou senha inválidos." })
            return
        }

        const token = jwt.sign(
            { userId: usuario.id, tipo },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        )

        if (tipo === "CLIENTE") {
            await prisma.cliente.update({ where: { id: usuario.id }, data: { ultimoLogin: new Date() } })
        } else if (tipo === "VENDEDOR") {
            await prisma.vendedor.update({ where: { id: usuario.id }, data: { ultimoLogin: new Date() } })
        } else {
            await prisma.admin.update({ where: { id: usuario.id }, data: { ultimoLogin: new Date() } })
        }

        res.status(200).json({
            mensagem: "Login efetuado com sucesso",
            token,
            usuario: { id: usuario.id, nome: usuario.nome, tipo }
        })
    } catch (error) {
        console.error("Falha, ", error)
        res.status(400).json({ error: "Falha no login." })
        return
    }
}