// Só estas categorias têm build (mods recomendados) no Warframe.
// O site mostra apenas itens delas, para a IA não inventar builds de mods, arcanos ou recursos.
export const CATEGORIAS_COM_BUILD = [
    "Warframes",
    "Armas Primárias",
    "Armas Secundárias",
    "Armas Corpo a Corpo",
    "Companheiros",
]

export function podeTerBuild(nomeCategoria: string): boolean {
    return CATEGORIAS_COM_BUILD.includes(nomeCategoria)
}

// filtro pronto para usar no Prisma: where: { categoria: filtroCategoriasBuild }
export const filtroCategoriasBuild = { nome: { in: CATEGORIAS_COM_BUILD } }
