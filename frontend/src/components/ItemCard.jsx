export function FotoItem({ item, className = "", texto = "text-5xl" }) {
    if (item.foto) {
        return <img src={item.foto} alt={item.nome} className={`object-cover ${className}`} />
    }
    // sem foto cadastrada: mostra a inicial do item
    return (
        <div className={`flex items-center justify-center bg-linear-to-br from-primary to-accent text-white font-bold ${texto} ${className}`}>
            {item.nome?.[0]?.toUpperCase()}
        </div>
    )
}

// Linha de item, no estilo da lista do Warframe Market
function ItemCard({ item, onAbrir }) {
    return (
        <li className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary transition-colors">
            <FotoItem item={item} className="w-11 h-11 rounded-full shrink-0" texto="text-lg" />
            <div className="flex-1 min-w-0">
                <button onClick={() => onAbrir(item.id)} className="block max-w-full truncate text-left font-semibold text-primary underline hover:text-primary-hover">
                    {item.nome}
                </button>
                <p className="text-xs text-muted truncate">
                    {item.categoria?.nome}
                    {item.destaque && <span className="text-amber-400"> · ★ destaque</span>}
                </p>
            </div>
            <button
                onClick={() => onAbrir(item.id)}
                className="shrink-0 bg-primary hover:bg-primary-hover text-white rounded px-3 py-2 text-sm transition-colors"
            >
                Ver detalhes
            </button>
        </li>
    )
}

export default ItemCard
