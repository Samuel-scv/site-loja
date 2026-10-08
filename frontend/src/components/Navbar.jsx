function Navbar({ onNavigate, user, token, onLogout }) {
    const link = "text-nav-text hover:text-primary-hover transition-colors text-sm"

    return (
        <nav className="bg-nav border-b-2 border-primary px-6 py-3 flex flex-wrap items-center gap-6">
            <button className="font-bold tracking-widest uppercase text-nav-text" onClick={() => onNavigate("home")}>
                Loja <span className="text-primary">Warframe</span>
            </button>
            <button className={link} onClick={() => onNavigate("conta")}>
                minha conta
            </button>
            <button className={link} onClick={() => onNavigate("historico")}>
                histórico
            </button>
            {user?.tipo === "CLIENTE" && (
                <button className={link} onClick={() => onNavigate("perguntas")}>
                    minhas perguntas
                </button>
            )}
            {user?.tipo === "ADMIN" && (
                <button className={link} onClick={() => onNavigate("admin")}>
                    painel admin
                </button>
            )}
            {user?.tipo === "VENDEDOR" && (
                <button className={link} onClick={() => onNavigate("vendedor")}>
                    minhas listagens
                </button>
            )}

            {token ? (
                <div className="ml-auto flex items-center gap-4">
                    {user && (
                        <span className="text-sm text-muted">
                            olá, <span className="text-nav-text">{user.nome}</span>
                        </span>
                    )}
                    <button className={link} onClick={onLogout}>sair</button>
                </div>
            ) : (
                <button className="ml-auto bg-primary hover:bg-primary-hover text-white rounded px-4 py-1 text-sm font-semibold transition-colors" onClick={() => onNavigate("auth")}>
                    login
                </button>
            )}
        </nav>
    )
}

export default Navbar
