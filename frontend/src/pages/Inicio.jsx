import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CartaoAvaliacao from '../components/CartaoAvaliacao.jsx'
import CartaoRestaurante from '../components/CartaoRestaurante.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { formatarNota } from '../utils/formatos.js'

const RECOMENDADOS_VISIVEIS = 4 
const RANKING_VISIVEIS = 4 
const FEED_POR_VEZ = 10 

// Tela inicial: recomendações (só USUARIO), avaliações recentes, ranking e restaurantes perto.

export default function Inicio() {
  const { usuario, logado } = useAuth()
  const recebeRecomendacoes = usuario?.papel === 'USUARIO'

  const [recomendacoes, setRecomendacoes] = useState(null)
  const [verTodasRecomendacoes, setVerTodasRecomendacoes] = useState(false)
  const [feed, setFeed] = useState(null)
  const [feedVisivel, setFeedVisivel] = useState(FEED_POR_VEZ)
  const [periodo, setPeriodo] = useState('semanal')
  const [ranking, setRanking] = useState(null)
  const [verTodoRanking, setVerTodoRanking] = useState(false)
  const [perto, setPerto] = useState(null)
  const [buscandoPerto, setBuscandoPerto] = useState(false)
  const [erros, setErros] = useState({})

  function registrarErro(bloco, falha) {
    setErros((atuais) => ({ ...atuais, [bloco]: falha.message }))
  }

  // Recomendações e feed: recarregam quando quem está logado muda.
  useEffect(() => {
    let cancelada = false
    setErros({})
    setFeedVisivel(FEED_POR_VEZ)

    if (recebeRecomendacoes) {
      api.listarRecomendacoes()
        .then((lista) => !cancelada && setRecomendacoes(lista))
        .catch((falha) => !cancelada && registrarErro('recomendacoes', falha))
    } else {
      setRecomendacoes(null)
    }

    api.listarFeed()
      .then((lista) => !cancelada && setFeed(lista))
      .catch((falha) => !cancelada && registrarErro('feed', falha))

    return () => {
      cancelada = true
    }
  }, [usuario?.id, recebeRecomendacoes])

  // Ranking: recarrega ao trocar entre semanal e mensal.
  useEffect(() => {
    let cancelada = false
    setRanking(null)
    api.buscarRanking(periodo)
      .then((lista) => !cancelada && setRanking(lista))
      .catch((falha) => !cancelada && registrarErro('ranking', falha))
    return () => {
      cancelada = true
    }
  }, [periodo])

  // "Perto de você" só pede a localização quando a pessoa clica no botão.
  function buscarPerto() {
    if (!navigator.geolocation) {
      registrarErro('perto', new Error('Este navegador não informa a localização.'))
      return
    }
    setBuscandoPerto(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const lista = await api.buscarRestaurantes({
            lat: coords.latitude, lng: coords.longitude, ordem: 'distancia',
          })
          setPerto(lista.slice(0, 5))
        } catch (falha) {
          registrarErro('perto', falha)
        } finally {
          setBuscandoPerto(false)
        }
      },
      () => {
        registrarErro('perto', new Error('Não foi possível obter a sua localização. Verifique a permissão do navegador.'))
        setBuscandoPerto(false)
      },
    )
  }

  const recomendadosNaTela = verTodasRecomendacoes ? recomendacoes : recomendacoes?.slice(0, RECOMENDADOS_VISIVEIS)

  return (
    <>
      <BarraNavegacao />
      <main className="container py-4">
        {logado ? (
          <header className="mb-4">
            <h1 className="mb-1">Olá, {usuario.nome.split(' ')[0]}</h1>
            <p className="fb-subtitulo mb-0">Veja o que combina com você e o que a comunidade anda avaliando.</p>
          </header>
        ) : (
          <header className="fb-cartao fb-boas-vindas p-4 mb-4">
            <h1 className="mb-2">Descubra restaurantes pela opinião de quem foi de verdade.</h1>
            <p className="fb-subtitulo">Entre para avaliar, salvar favoritos e receber recomendações que combinam com o seu gosto.</p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/login" className="fb-botao fb-botao-principal">Entrar</Link>
              <Link to="/cadastro" className="fb-botao fb-botao-claro">Criar conta</Link>
            </div>
          </header>
        )}

        {recebeRecomendacoes && (
          <section className="mb-5">
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
              <div>
                <h2 className="mb-0">Recomendados para você</h2>
                <p className="fb-cartao-meta">Pelas suas preferências e pelo que você já avaliou e favoritou.</p>
              </div>
              <Link to="/preferencias" className="fb-link">
                <i className="bi bi-sliders" aria-hidden="true"></i> Ajustar preferências
              </Link>
            </div>

            <Aviso>{erros.recomendacoes}</Aviso>
            {!erros.recomendacoes && recomendacoes === null && <p className="fb-vazio">Carregando…</p>}
            {recomendacoes?.length === 0 && (
              <p className="fb-vazio">Você já avaliou todos os restaurantes do FourBites. Volte quando chegarem novos!</p>
            )}

            {recomendacoes?.length > 0 && (
              <>
                <div className="row g-3">
                  {recomendadosNaTela.map((item) => (
                    <div key={item.restaurante.id} className="col-sm-6 col-lg-3">
                      <CartaoRestaurante restaurante={item.restaurante} compatibilidade={item.compatibilidade} />
                    </div>
                  ))}
                </div>
                {recomendacoes.length > RECOMENDADOS_VISIVEIS && (
                  <div className="text-center mt-3">
                    <button type="button" className="fb-botao fb-botao-claro"
                      onClick={() => setVerTodasRecomendacoes(!verTodasRecomendacoes)}>
                      {verTodasRecomendacoes ? 'Mostrar menos' : `Ver todas (${recomendacoes.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <section className="mb-5">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
            <div>
              <h2 className="mb-0">Ranking {periodo === 'semanal' ? 'da semana' : 'do mês'}</h2>
              <p className="fb-cartao-meta">
                Maiores notas {periodo === 'semanal' ? 'dos últimos 7 dias' : 'dos últimos 30 dias'}, entre restaurantes com pelo menos 2 avaliações.
              </p>
            </div>
            <div className="d-flex gap-2" role="group" aria-label="Período do ranking">
              {['semanal', 'mensal'].map((p) => (
                <button key={p} type="button" aria-pressed={periodo === p}
                  className={`fb-chip ${periodo === p ? 'ativo' : ''}`}
                  onClick={() => { setPeriodo(p); setVerTodoRanking(false) }}>
                  {p === 'semanal' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          <Aviso>{erros.ranking}</Aviso>
          {!erros.ranking && ranking === null && <p className="fb-vazio">Carregando…</p>}
          {ranking?.length === 0 && (
            <p className="fb-vazio">
              Nenhum restaurante teve 2 avaliações {periodo === 'semanal' ? 'nos últimos 7 dias' : 'nos últimos 30 dias'} ainda.
            </p>
          )}

          {ranking?.length > 0 && (
            <>
              <div className="row g-3">
                {(verTodoRanking ? ranking : ranking.slice(0, RANKING_VISIVEIS)).map((item) => (
                  <div key={item.restaurante.id} className="col-sm-6 col-lg-3">
                    <CartaoRestaurante
                      restaurante={item.restaurante}
                      ranking={{ posicao: item.posicao, nota: item.notaPeriodo, avaliacoes: item.avaliacoesPeriodo, periodo }}
                    />
                  </div>
                ))}
              </div>
              {ranking.length > RANKING_VISIVEIS && (
                <div className="text-center mt-3">
                  <button type="button" className="fb-botao fb-botao-claro" onClick={() => setVerTodoRanking(!verTodoRanking)}>
                    {verTodoRanking ? 'Mostrar menos' : `Ver todo o ranking (${ranking.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="row g-4">
          <section className="col-lg-8">
            <h2 className="mb-0">Avaliações recentes</h2>
            <p className="fb-cartao-meta mb-3">
              {recebeRecomendacoes ? 'Primeiro de quem você segue, depois da comunidade.' : 'O que a comunidade anda avaliando.'}
            </p>

            <Aviso>{erros.feed}</Aviso>
            {!erros.feed && feed === null && <p className="fb-vazio">Carregando…</p>}
            {feed?.length === 0 && <p className="fb-vazio">Ainda não há avaliações por aqui.</p>}
            {feed?.slice(0, feedVisivel).map((a) => <CartaoAvaliacao key={a.id} avaliacao={a} />)}
            {feed && feed.length > feedVisivel && (
              <div className="text-center">
                <button type="button" className="fb-botao fb-botao-claro"
                  onClick={() => setFeedVisivel(feedVisivel + FEED_POR_VEZ)}>
                  Ver mais avaliações
                </button>
              </div>
            )}
          </section>

          <aside className="col-lg-4">
            <section className="fb-cartao p-4 mb-3">
              <h2 className="mb-3"><i className="bi bi-geo-alt fb-icone-titulo" aria-hidden="true"></i> Perto de você</h2>
              <Aviso>{erros.perto}</Aviso>

              {perto === null ? (
                <button type="button" className="fb-botao fb-botao-suave w-100" onClick={buscarPerto} disabled={buscandoPerto}>
                  {buscandoPerto ? 'Buscando…' : 'Usar minha localização'}
                </button>
              ) : perto.length === 0 ? (
                <p className="fb-cartao-meta mb-0">Nenhum restaurante encontrado.</p>
              ) : (
                <ul className="fb-lista-compacta">
                  {perto.map((r) => (
                    <li key={r.id}>
                      <Link to={`/restaurantes/${r.id}`} className="flex-grow-1 fb-link-discreto">
                        {r.nome}
                        <small className="d-block fb-cartao-meta mt-0">
                          {r.categoria?.nome} · {formatarNota(r.distanciaKm)} km
                        </small>
                      </Link>
                      <span className="fb-nota">
                        <i className="bi bi-star-fill" aria-hidden="true"></i> {formatarNota(r.notaMedia)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/explorar" className="fb-link d-block text-center mt-3">Ver todos no Explorar</Link>
            </section>
          </aside>
        </div>
      </main>
    </>
  )
}
