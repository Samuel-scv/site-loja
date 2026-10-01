import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export async function ListarItens(req: Request, res: Response) {
    try {
        const listar = await prisma.item.findMany({
            include: { categoria: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(listar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao listar itens." });
    }
}

export async function CriarItem(req: Request, res: Response) {
    try {
        const { id_categoria, nome, descricao, foto, destaque } = req.body;

        if (!id_categoria || !nome) {
            res.status(400).json({ error: "Categoria e nome são obrigatórios." });
            return;
        }

        const criar = await prisma.item.create({
            data: {
                id_categoria: Number(id_categoria),
                nome,
                descricao: descricao || null,
                foto: foto || null,
                destaque: destaque === true || destaque === "true"
            }
        });

        res.status(201).json(criar);
    } catch (error) {
        res.status(400).json({ error: "Falha ao criar item." });
    }
}

export async function AtualizarItem(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { nome, descricao, foto, destaque, id_categoria } = req.body;

        const atualizar = await prisma.item.update({
            where: { id: Number(id) },
            data: {
                nome,
                descricao,
                foto,
                destaque: destaque !== undefined ? (destaque === true || destaque === "true") : undefined,
                id_categoria: id_categoria ? Number(id_categoria) : undefined
            }
        });

        res.status(200).json({ mensagem: "Item atualizado: ", atualizar });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            res.status(404).json({ error: "Item não encontrado." });
            return;
        }
        res.status(400).json({ error: "Falha ao atualizar item." });
    }
}

export async function DeletarItem(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const deletar = await prisma.item.delete({ where: { id: Number(id) } });
        res.status(200).json({ mensagem: "Item deletado com sucesso.", deletar });
    } catch (error) {
        res.status(400).json({ error: "Falha ao deletar item. Verifique dependências." });
    }
}