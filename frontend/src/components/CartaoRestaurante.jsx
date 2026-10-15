import { Link } from 'react-router-dom'

import { formatarNota } from '../utils/formatos.js'

// Cartão de um restaurante na lista da busca
export default function CartaoRestaurante({ restaurante }) {
  const r = restaurante

  return (
    <Link to={`/restaurantes/${r.id}`} className="fb-cartao fb-cartao-restaurante">
      <div className="fb-cartao-foto">
        {r.fotoCapa ? (
          <img src={r.fotoCapa} alt="" />
        ) : (
          <span className="fb-sem-foto"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
        )}
        {r.distanciaKm !== null && (
          <span className="fb-selo-distancia">
            <i className="bi bi-geo-alt-fill" aria-hidden="true"></i> {formatarNota(r.distanciaKm)} km
          </span>
        )}
      </div>

      <div className="fb-cartao-corpo">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h3 className="fb-cartao-titulo">{r.nome}</h3>
          <span className="fb-nota">
            <i className="bi bi-star-fill" aria-hidden="true"></i> {formatarNota(r.notaMedia)}
          </span>
        </div>

        <p className="fb-cartao-meta">
          {r.categoria?.nome} · {r.faixaPreco} · {r.bairro}, {r.cidade}
        </p>
        <p className="fb-cartao-meta">
          {r.totalAvaliacoes === 0
            ? 'Ainda sem avaliações'
            : `${r.totalAvaliacoes} ${r.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
        </p>

        <div className="d-flex flex-wrap gap-2 mt-2">
          {r.aceitaPets && <span className="fb-etiqueta">Pet friendly</span>}
          {r.acessivel && <span className="fb-etiqueta">Acessível</span>}
        </div>
      </div>
    </Link>
  )
}
