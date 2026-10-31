import { Link } from 'react-router-dom'

import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import { CARACTERISTICAS } from '../utils/restaurantes.js'
import IconeCozinha from './IconeCozinha.jsx'
import SeloCompatibilidade from './SeloCompatibilidade.jsx'
import { foto } from '../utils/imagens.js'

// Cartão de um restaurante (Início, Explorar).

export default function CartaoRestaurante({ restaurante, compatibilidade, ranking, destaque, aoPassarMouse }) {
  const r = restaurante
  const cor = corDaCozinha(r.categoria)

  return (
    <Link to={`/restaurantes/${r.id}`} className={`fb-cartao-restaurante ${destaque ? 'destaque' : ''}`}
      onMouseEnter={aoPassarMouse} onFocus={aoPassarMouse}>
      <div className="fb-cartao-foto" style={{ background: cor }}>
        {r.fotoCapa ? (
          <img src={foto(r.fotoCapa, 640)} alt="" />
        ) : (
          <span className="fb-sem-foto"><IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={48} /></span>
        )}
        {ranking && <span className="fb-selo-posicao">{ranking.posicao}º</span>}
        {r.distanciaKm !== null && r.distanciaKm !== undefined && (
          <span className="fb-selo-distancia">{formatarNota(r.distanciaKm)} km</span>
        )}
      </div>

      <div className="fb-cartao-corpo">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h3 className="fb-cartao-titulo">{r.nome}</h3>
          <span className="fb-nota">★ {formatarNota(r.notaMedia)}</span>
        </div>
        <p className="fb-cartao-meta">
          {r.categoria?.nome} · {r.faixaPreco} · {r.bairro}
          {' · '}
          {r.totalAvaliacoes === 0 ? 'sem avaliações' : `${r.totalAvaliacoes} ${r.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
        </p>

        {(compatibilidade !== undefined || ranking) && (
          <div className="mt-1">
            {compatibilidade !== undefined && <SeloCompatibilidade valor={compatibilidade} dentroDeLink />}
            {ranking && (
              <span className="fb-selo" style={{ background: 'var(--fb-rosa-claro)' }}>
                ★ {formatarNota(ranking.nota)} {ranking.periodo === 'semanal' ? 'na semana' : 'no mês'} · {ranking.avaliacoes} avaliações
              </span>
            )}
          </div>
        )}

        {CARACTERISTICAS.some((c) => r[c.campo]) && (
          <div className="d-flex flex-wrap gap-2 mt-1">
            {CARACTERISTICAS.filter((c) => r[c.campo]).map((c) => (
              <span key={c.campo} className="fb-etiqueta" style={{ background: c.cor }}>
                <i className={`bi ${c.icone}`} aria-hidden="true"></i>{c.rotulo}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
