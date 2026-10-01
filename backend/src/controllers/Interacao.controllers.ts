import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import type { AuthRequest } from "../middlewares/AuthMiddlewares.js";

export async function CriarInteracao(req: AuthRequest, res: Response) {
    try {
        const { id_item, pergunta } = req.body;

        if (!id_item || !pergunta) {
            res.status(400).json({ error: "Item e pergunta são obrigatórios." });
            return;
        }

        const interacao = await prisma.interacao.create({
            data: {
                id_cliente: req.userId!,
                id_item: Number(id_item),
                pergunta
            }
        });

        res.status(201).json(interacao);
    } catch (error) {
        res.status(400).json({ error: "Falha ao enviar pergunta." });
    }
}

export async function MinhasInteracoes(req: AuthRequest, res: Response) {
    try {
        const interacoes = await prisma.interacao.findMany({
            where: { id_cliente: req.userId! },
            include: { item: { select: { nome: true, foto: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(interacoes);
    } catch (error) {
        res.status(400).json({ error: "Falha ao carregar suas interações." });
    }
}

export async function ListarTodasInteracoes(req: AuthRequest, res: Response) {
    try {
        const interacoes = await prisma.interacao.findMany({
            include: {
                cliente: { select: { nome: true, email: true } },
                item: { select: { nome: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(interacoes);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar interações." });
    }
}

export async function ResponderInteracao(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { resposta } = req.body;

        if (!resposta) {
            res.status(400).json({ error: "A resposta não pode ser vazia." });
            return;
        }

        const atualizada = await prisma.interacao.update({
            where: { id: Number(id) },
            data: { resposta }
        });

        res.status(200).json(atualizada);
    } catch (error) {
        res.status(400).json({ error: "Falha ao responder pergunta." });
    }
}

export async function DeletarInteracao(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;

        await prisma.interacao.delete({ where: { id: Number(id) } });
        res.status(200).json({ mensagem: "Interação excluída com sucesso." });
    } catch (error) {
        res.status(400).json({ error: "Falha ao excluir interação." });
    }
}