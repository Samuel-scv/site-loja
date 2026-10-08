// Validações simples, sem biblioteca. Cada função devolve uma mensagem de erro
// (string) quando algo está errado, ou null quando está tudo certo.

export function validarCadastro(nome: unknown, email: unknown, senha: unknown): string | null {
    if (typeof nome !== "string" || nome.trim().length < 2) return "Nome muito curto."
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Email inválido."
    if (typeof senha !== "string" || senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres."
    return null
}

export function numeroNaoNegativo(valor: unknown): boolean {
    const n = Number(valor)
    return Number.isFinite(n) && n >= 0
}
