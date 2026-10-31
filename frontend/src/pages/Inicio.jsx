import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import BuscaGeral from '../components/BuscaGeral.jsx'
import CarrosselCozinhas from '../components/CarrosselCozinhas.jsx'
import CartaoLista from '../components/CartaoLista.jsx'
import PessoasParaSeguir from '../components/PessoasParaSeguir.jsx'
import SeloOficial from '../components/SeloOficial.jsx'
import CartaoAvaliacao from '../components/CartaoAvaliacao.jsx'
import Carrossel from '../components/Carrossel.jsx'
import CartaoRestaurante from '../components/CartaoRestaurante.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { formatarNota } from '../utils/formatos.js'
import mascote from '../assets/mascote.webp'
import { temRecursosDeUsuario } from '../utils/papeis.js'

const FEED_POR_VEZ = 10

// Tela inicial: destaque com busca, cozinhas, recomendações (só USUARIO), ranking, avaliações recentes e "perto de você".
export default function Inicio() {
  const { usuario, logado } = useAuth()
  const recebeRecomendacoes = temRecursosDeUsuario(usuario)

  const [categorias, setCategorias] = useState([])
  const [listasOficiais, setListasOficiais] = useState([]) // "sugestões do autor": listas públicas do Farelo
  const [recomendacoes, setRecomendacoes] = useState(null)
  const [feed, setFeed] = useState(null)
  const [feedVisivel, setFeedVisivel] = useState(FEED_POR_VEZ)
  const [periodo, setPeriodo] = useState('semanal')
  const [ranking, setRanking] = useState(null)
  const [perto, setPerto] = useState(null)
  const [buscandoPerto, setBuscandoPerto] = useState(false)
  const [erros, setErros] = useState({})

  function registrarErro(bloco, falha) {
    setErros((atuais) => ({ ...atuais, [bloco]: falha.message }))
  }

  // Cozinhas: só para os atalhos "Explore por cozinha". Se falhar, o bloco some.
  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => setCategorias([]))
    // Sugestões do Farelo: se não houver listas (ou falhar), a seção some.
    api.listarListasOficiais().then(setListasOficiais).catch(() => setListasOficiais([]))
  }, [])

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

  const primeiroDoRanking = ranking?.[0]

  return (
    <>
      <BarraNavegacao />
      <main>
        {/* Destaque */}
        <section className="fb-conteudo">
          <div className="fb-destaque-topo">
            <div className="fb-destaque-texto">
              <span className="fb-mao" style={{ fontSize: '1.9rem' }}>
                {logado ? `oi, ${usuario.nome.split(' ')[0]}!` : 'oi, que fome!'}
              </span>
              <h1>Bora descobrir onde <span className="fb-sublinhado">comer</span> hoje?</h1>
              <p className="fb-subtitulo mb-0" style={{ maxWidth: '30em' }}>
                {logado
                  ? 'Recomendações que combinam com o seu gosto e avaliações de quem foi de verdade.'
                  : 'Avaliações de quem foi de verdade. Entre para receber recomendações que combinam com você.'}
              </p>

              {/* Mesma busca da barra de cima*/}
              <div className="fb-busca-com-farelo">
                <BuscaGeral grande />
              </div>

              {logado ? (
                <div className="d-flex flex-wrap gap-2">
                  <span className="fb-selo" style={{ background: 'var(--fb-rosa-claro)' }}>Avaliações de verdade</span>
                  <span className="fb-selo" style={{ background: 'var(--fb-amarelo-claro)' }}>Sem conteúdo patrocinado</span>
                  <span className="fb-selo" style={{ background: 'var(--fb-verde-claro)' }}>Feito pro seu gosto</span>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/cadastro" className="fb-botao fb-botao-amarelo">Criar conta</Link>
                  <Link to="/login" className="fb-botao fb-botao-claro">Entrar</Link>
                </div>
              )}
            </div>

            {/* Composição: o mascote no círculo creme (e, se houver, o adesivo do 1º do ranking) */}
            <div className="fb-destaque-arte d-none d-md-block" aria-hidden="true">
              <span className="fb-bolha" style={{ inset: '20px 0 0 30px', background: 'var(--fb-amarelo)', borderRadius: '46% 54% 42% 58% / 52% 40% 60% 48%' }}></span>
              <span className="fb-bolha"
                style={{ left: '90px', top: '60px', width: '290px', height: '290px', background: 'var(--fb-creme)' }}></span>
              {/* Fora do círculo (sem overflow) para o mascote poder "sair" por cima dele */}
              <img src={mascote} alt="" className="fb-destaque-mascote" />
               <span className="fb-farelo-nome">
                esse é o Farelo!
                <svg width="74" height="56" viewBox="0 0 74 56" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6c20 2 44 12 58 40" />
                  <path d="M50 42l14 4 2-15" />
                </svg>
              </span>
              <span className="fb-bolha" style={{ right: '10px', top: '10px', width: '110px', height: '110px', background: '#ff8fa9' }}></span>
              <span className="fb-bolha" style={{ left: '10px', bottom: '30px', width: '96px', height: '96px', background: '#7fd1a3' }}></span>
              {primeiroDoRanking && (
                <span className="fb-adesivo" style={{ right: '20px', bottom: '50px' }}>
                  <strong className="d-block" style={{ fontFamily: 'var(--fb-titulo)', color: 'var(--fb-tinta)', fontSize: '1.1rem' }}>
                    {primeiroDoRanking.restaurante.nome}
                  </strong>
                  <span className="fw-bold" style={{ color: 'var(--fb-vermelho)' }}>
                    ★ {formatarNota(primeiroDoRanking.notaPeriodo)} · 1º {periodo === 'semanal' ? 'da semana' : 'do mês'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Explore por cozinha */}
        <CarrosselCozinhas categorias={categorias} />

        {/* Recomendados */}
        {recebeRecomendacoes && (
          <section className="fb-conteudo fb-secao pt-0">
            {/* Fileira com setinhas: mostra todas as recomendações (antes era "Ver todos") */}
            <Carrossel nome="Recomendados" className="fb-carrossel-cartoes" titulo={
              <div>
                <h2 className="mb-0">Recomendados para você</h2>
                <p>Pelas suas preferências e pelo que você já avaliou e favoritou.</p>
              </div>
            }>
              {recomendacoes?.map((item) => (
                <div key={item.restaurante.id}>
                  <CartaoRestaurante restaurante={item.restaurante} compatibilidade={item.compatibilidade} />
                </div>
              ))}
            </Carrossel>

            <Aviso>{erros.recomendacoes}</Aviso>
            {!erros.recomendacoes && recomendacoes === null && <p className="fb-vazio">Carregando…</p>}
            {recomendacoes?.length === 0 && (
              <p className="fb-vazio">Você já avaliou todos os restaurantes do FourBites. Volte quando chegarem novos!</p>
            )}
          </section>
        )}

        {/* Sugestões do autor: listas públicas do perfil oficial (o Farelo) */}
        {listasOficiais.length > 0 && (
          <section className="fb-conteudo fb-secao pt-0">
            <span className="fb-mao" style={{ marginBottom: '0.6rem' }}>escolhidas a dedo</span>            
            <Carrossel nome="Sugestões do Farelo" className="fb-carrossel-cartoes" titulo={
              <div>
                <h2 className="mb-0">
                  Sugestões do {listasOficiais[0].dono.nome} <SeloOficial compacto />
                </h2>
                <p>Listas montadas pelo perfil oficial do FourBites.</p>
              </div>
            }>
              {listasOficiais.map((l) => <div key={l.id}><CartaoLista lista={l} /></div>)}
            </Carrossel>
          </section>
        )}

        {/* Pessoas para seguir (só conta USUARIO) */}
        {recebeRecomendacoes && <PessoasParaSeguir />}

        {/* Ranking: faixa amarela */}
        <section className="fb-faixa-ranking">
          <div className="fb-conteudo">
            <span className="fb-mao" style={{ marginBottom: '0.6rem' }}>os queridinhos</span>           
            {/* Fileira com setinhas*/}
            <Carrossel nome="Ranking" className="fb-carrossel-cartoes"
              titulo={<h2 className="mb-0">Ranking {periodo === 'semanal' ? 'da semana' : 'do mês'}</h2>}
              acoes={
                <div className="d-flex gap-2" role="group" aria-label="Período do ranking">
                  {['semanal', 'mensal'].map((p) => (
                    <button key={p} type="button" aria-pressed={periodo === p}
                      className={`fb-botao fb-botao-pequeno ${periodo === p ? 'fb-botao-principal' : 'fb-botao-claro'}`}
                      onClick={() => setPeriodo(p)}>
                      {p === 'semanal' ? 'Semana' : 'Mês'}
                    </button>
                  ))}
                </div>
              }>
              {ranking?.map((item) => (
                <div key={item.restaurante.id}>
                  <CartaoRestaurante
                    restaurante={item.restaurante}
                    ranking={{ posicao: item.posicao, nota: item.notaPeriodo, avaliacoes: item.avaliacoesPeriodo, periodo }}
                  />
                </div>
              ))}
            </Carrossel>

            <Aviso>{erros.ranking}</Aviso>
            {!erros.ranking && ranking === null && <p className="fb-vazio">Carregando…</p>}
            {ranking?.length === 0 && (
              <p className="fb-vazio">
                Nenhum restaurante teve 2 avaliações {periodo === 'semanal' ? 'nos últimos 7 dias' : 'nos últimos 30 dias'} ainda.
              </p>
            )}
          </div>
        </section>

        {/* Avaliações recentes + perto de você */}
        <section className="fb-conteudo pt-5 mt-4">
          <div className="row g-5">
            <div className="col-lg-8">
              <h2 className="mb-0">Avaliações recentes</h2>
              <p className="mb-4">
                {recebeRecomendacoes ? 'Primeiro de quem você segue, depois da comunidade.' : 'O que a comunidade anda avaliando.'}
              </p>

              <Aviso>{erros.feed}</Aviso>
              {!erros.feed && feed === null && <p className="fb-vazio">Carregando…</p>}
              {feed?.length === 0 && <p className="fb-vazio">Ainda não há avaliações por aqui.</p>}
              {feed?.slice(0, feedVisivel).map((a) => <CartaoAvaliacao key={a.id} avaliacao={a} />)}
              {feed && feed.length > feedVisivel && (
                <div className="text-center mt-4">
                  <button type="button" className="fb-botao fb-botao-claro"
                    onClick={() => setFeedVisivel(feedVisivel + FEED_POR_VEZ)}>
                    Ver mais avaliações
                  </button>
                </div>
              )}
            </div>

            <aside className="col-lg-4">
              <section className="fb-perto">
                <h2 className="mb-0" style={{ fontSize: '1.75rem' }}>Perto de você</h2>
                <Aviso>{erros.perto}</Aviso>

                {perto === null ? (
                  <>
                    <p className="mb-0">Veja os restaurantes mais próximos de onde você está.</p>
                    <button type="button" className="fb-botao fb-botao-amarelo" onClick={buscarPerto} disabled={buscandoPerto}>
                      {buscandoPerto ? 'Buscando…' : 'Usar minha localização'}
                    </button>
                  </>
                ) : perto.length === 0 ? (
                  <p className="mb-0">Nenhum restaurante encontrado.</p>
                ) : (
                  <ul className="fb-lista-compacta">
                    {perto.map((r) => (
                      <li key={r.id}>
                        <Link to={`/restaurantes/${r.id}`} className="flex-grow-1 fb-link-discreto">
                          <strong>{r.nome}</strong>
                          <small className="d-block fb-cartao-meta mt-0">
                            {r.categoria?.nome} · {formatarNota(r.distanciaKm)} km
                          </small>
                        </Link>
                        <span className="fb-nota">★ {formatarNota(r.notaMedia)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/explorar" className="fb-link-discreto fw-bold text-center">Ver todos no Explorar</Link>
              </section>
            </aside>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  )
}