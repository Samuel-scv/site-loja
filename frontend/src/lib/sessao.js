// "Manter conectado" marcado: token e id (uuid) do cliente ficam no localStorage
// e continuam valendo nos próximos acessos.
// Desmarcado: o token fica só no sessionStorage (some quando fecha a aba).

export function salvarSessao(token, usuario, manter) {
    limparSessao()
    if (manter) {
        localStorage.setItem("token", token)
        if (usuario?.tipo === "CLIENTE") localStorage.setItem("clienteKey", usuario.uuid)
    } else {
        sessionStorage.setItem("token", token)
    }
}

export function lerToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
}

export function lerClienteKey() {
    return localStorage.getItem("clienteKey")
}

export function limparSessao() {
    localStorage.removeItem("token")
    localStorage.removeItem("clienteKey")
    sessionStorage.removeItem("token")
}
