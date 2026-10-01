function Conta({ user }) {
    if (!user) {
        return <div className="max-w-sm mx-auto mt-16 text-center text-muted">carregando seus dados...</div>
    }

    return (
        <div className="max-w-sm mx-auto mt-16 bg-surface border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold text-text mb-6">Minha conta</h1>
            <dl className="space-y-3 text-text">
                <div>
                    <dt className="text-xs uppercase text-muted">Nome</dt>
                    <dd>{user.nome}</dd>
                </div>
                <div>
                    <dt className="text-xs uppercase text-muted">Email</dt>
                    <dd>{user.email}</dd>
                </div>
                <div>
                    <dt className="text-xs uppercase text-muted">Tipo</dt>
                    <dd>{user.tipo}</dd>
                </div>
                {user.tipo !== "ADMIN" && (
                    <>
                        <div>
                            <dt className="text-xs uppercase text-muted">Platinas</dt>
                            <dd>{Number(user.saldo_platinas).toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase text-muted">Créditos</dt>
                            <dd>{Number(user.saldo_creditos).toFixed(2)}</dd>
                        </div>
                    </>
                )}
            </dl>
        </div>
    )
}

export default Conta
