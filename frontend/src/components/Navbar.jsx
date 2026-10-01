function Navbar({ onNavigate, user, token, onLogout }) {
    return (
        <nav className="bg-nav px-6 py-3 flex flex-wrap items-center gap-6">
            <button className="font-bold text-nav-text" onClick={() => onNavigate("home")}>
                loja
            </button>
            <button className="text-nav-text" onClick={() => onNavigate("conta")}>
                minha conta
            </button>
            <button className="text-nav-text" onClick={() => onNavigate("historico")}>
                histórico
            </button>
            {user?.tipo === "VENDEDOR" && (
                <button className="text-nav-text" onClick={() => onNavigate("vendedor")}>
                    minhas listagens
                </button>
            )}

            {token ? (
                <div className="ml-auto flex items-center gap-4">
                    {user && (
                        <span className="text-sm text-nav-text opacity-70">
                            olá, <span>{user.nome}</span>
                        </span>
                    )}
                    <button className="text-nav-text" onClick={onLogout}>sair</button>
                </div>
            ) : (
                <button className="ml-auto text-accent hover:underline text-sm font-semibold" onClick={() => onNavigate("auth")}>
                    login
                </button>
            )}
        </nav>
    )
}

export default Navbar
