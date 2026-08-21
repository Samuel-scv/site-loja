import type { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../../lib/prisma.js";

export async function Login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body
        if (!email || !senha) {
            res.status(400).json({ error: "Email e senha obrigatórios." })
            return
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        })

        if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
            res.status(400).json({ error: "Email ou senha inválidos." })
            return
        }

        const token = jwt.sign(
            { usuarioId: usuario.id, cargo: usuario.cargo },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        )

        res.status(200).json({
            mensagem: "Usuario logado com sucesso",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                cargo: usuario.cargo
            }
        })
    } catch (error) {
        res.status(400).json({ error: "Falha no login do usuario" })
    }
}