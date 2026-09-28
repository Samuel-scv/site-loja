import { prisma } from "./prisma.js"

// Cliente, vendedor e admin são tabelas separadas, mas o Login procura o email
// nas três. Se o mesmo email existir em duas, só a primeira conta consegue entrar.
// Por isso o cadastro confere as três antes de criar.
export async function emailEmUso(email: string): Promise<boolean> {
    const [cliente, vendedor, admin] = await Promise.all([
        prisma.cliente.findUnique({ where: { email }, select: { id: true } }),
        prisma.vendedor.findUnique({ where: { email }, select: { id: true } }),
        prisma.admin.findUnique({ where: { email }, select: { id: true } })
    ])
    return Boolean(cliente || vendedor || admin)
}
