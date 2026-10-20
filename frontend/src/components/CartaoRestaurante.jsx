import { Link } from 'react-router-dom'

import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'
import IconeCozinha from './IconeCozinha.jsx'
import SeloCompatibilidade from './SeloCompatibilidade.jsx'

// Cartão de um restaurante (Início, Explorar).
// "compatibilidade" só vem nas recomendações; "ranking" ({ posicao, nota, avaliacoes, periodo }) só no ranking.
// "destaque" e "aoPassarMouse" ligam o cartão ao pino do mapa no Explorar.
export default function CartaoRestaurante({ restaurante, compatibilidade, ranking, destaque, aoPassarMouse }) {
  const r = restaurante
  const cor = corDaCozinha(r.categoria?.id)

  return (
    <Link to={`/restaurantes/${r.id}`} className={`fb-cartao-restaurante ${destaque ? 'destaque' : ''}`}
      onMouseEnter={aoPassarMouse} onFocus={aoPassarMouse}>
      <div className="fb-cartao-foto" style={{ background: cor }}>
        {r.fotoCapa ? (
          <img src={r.fotoCapa} alt="" />
        ) : (
          <span className="fb-sem-foto"><IconeCozinha nome={r.categoria?.nome} tamanho={48} /></span>
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
            {compatibilidade !== undefined && <SeloCompatibilidade valor={compatibilidade} />}
            {ranking && (
              <span className="fb-selo" style={{ background: 'var(--fb-rosa-claro)' }}>
                ★ {formatarNota(ranking.nota)} {ranking.periodo === 'semanal' ? 'na semana' : 'no mês'} · {ranking.avaliacoes} avaliações
              </span>
            )}
          </div>
        )}

        {(r.aceitaPets || r.acessivel) && (
          <div className="d-flex flex-wrap gap-2 mt-1">
            {r.aceitaPets && <span className="fb-etiqueta">Pet friendly</span>}
            {r.acessivel && <span className="fb-etiqueta fb-etiqueta-azul">Acessível</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
