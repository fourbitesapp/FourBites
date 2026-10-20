import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import Avatar from '../components/Avatar.jsx'
import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CartaoRestaurante from '../components/CartaoRestaurante.jsx'
import MapaExplorar from '../components/MapaExplorar.jsx'
import Rodape from '../components/Rodape.jsx'
import Seletor from '../components/Seletor.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'

const FILTROS_INICIAIS = {
  busca: '', categoriaId: '', faixaPreco: '', notaMin: '', pets: false, acessivel: false, ordem: '',
}

const PRECOS = [
  { valor: '', rotulo: 'Qualquer preço' },
  { valor: '$', rotulo: '$ · mais em conta' },
  { valor: '$$', rotulo: '$$ · preço médio' },
  { valor: '$$$', rotulo: '$$$ · mais caro' },
]

const NOTAS = [
  { valor: '', rotulo: 'Qualquer nota' },
  { valor: '3', rotulo: 'Nota 3 ou mais' },
  { valor: '4', rotulo: 'Nota 4 ou mais' },
  { valor: '4.5', rotulo: 'Nota 4,5 ou mais' },
]

// Lista de restaurantes com filtros, ao lado de um mapa com um pino para cada um.
// Quando há um texto de busca, aparecem antes também as pessoas com aquele nome ou @username.
// A busca da barra do topo e os atalhos de cozinha do Início chegam pela URL (?busca= e ?categoriaId=).
export default function Explorar() {
  const [parametros] = useSearchParams()
  const buscaDaUrl = parametros.get('busca') || ''
  const categoriaDaUrl = parametros.get('categoriaId') || ''
  const [filtros, setFiltros] = useState({ ...FILTROS_INICIAIS, busca: buscaDaUrl, categoriaId: categoriaDaUrl })
  const [posicao, setPosicao] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [restaurantes, setRestaurantes] = useState(null)
  const [pessoas, setPessoas] = useState([])
  const [destaqueId, setDestaqueId] = useState(null)
  const [erro, setErro] = useState(null)
  const [avisoLocalizacao, setAvisoLocalizacao] = useState(null)

  // Se a pessoa buscar de novo pela barra do topo estando no Explorar, a URL muda e o filtro acompanha.
  useEffect(() => {
    setFiltros((atuais) => ({ ...atuais, busca: buscaDaUrl, categoriaId: categoriaDaUrl }))
  }, [buscaDaUrl, categoriaDaUrl])

  // As categorias do filtro são carregadas uma vez, ao abrir a tela.
  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    let cancelada = false
    const espera = setTimeout(() => {
      api.buscarRestaurantes({ ...filtros, lat: posicao?.lat, lng: posicao?.lng })
        .then((lista) => {
          if (!cancelada) {
            setRestaurantes(lista)
            setErro(null)
          }
        })
        .catch((falha) => {
          if (!cancelada) {
            setErro(falha)
            setRestaurantes([])
          }
        })
    }, 300)

    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [filtros, posicao])

  // Pessoas: só busca com 2 letras ou mais. Se der erro, a seção simplesmente não aparece.
  useEffect(() => {
    const termo = filtros.busca.trim()
    if (termo.replace('@', '').length < 2) {
      setPessoas([])
      return
    }
    let cancelada = false
    const espera = setTimeout(() => {
      api.buscarUsuarios(termo)
        .then((lista) => !cancelada && setPessoas(lista))
        .catch(() => !cancelada && setPessoas([]))
    }, 300)
    return () => {
      cancelada = true
      clearTimeout(espera)
    }
  }, [filtros.busca])

  function mudarFiltro(nome, valor) {
    setFiltros({ ...filtros, [nome]: valor })
  }

  function usarMinhaLocalizacao() {
    setAvisoLocalizacao(null)
    if (!navigator.geolocation) {
      setAvisoLocalizacao('Este navegador não informa a localização.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (resultado) => {
        setPosicao({ lat: resultado.coords.latitude, lng: resultado.coords.longitude })
        setFiltros((atuais) => ({ ...atuais, ordem: 'distancia' }))
      },
      () => setAvisoLocalizacao('Não foi possível obter a sua localização. Verifique a permissão do navegador.'),
    )
  }

  function deixarDeUsarLocalizacao() {
    setPosicao(null)
    setFiltros((atuais) => ({ ...atuais, ordem: atuais.ordem === 'distancia' ? '' : atuais.ordem }))
  }

  function limpar() {
    setFiltros(FILTROS_INICIAIS)
    setPosicao(null)
    setAvisoLocalizacao(null)
  }

  const temFiltro = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIAIS) || posicao !== null
  const noMapa = (restaurantes || []).filter((r) => r.latitude !== null && r.longitude !== null)

  const opcoesCategoria = [
    { valor: '', rotulo: 'Todas as cozinhas' },
    ...categorias.map((c) => ({ valor: String(c.id), rotulo: c.nome, cor: corDaCozinha(c.id) })),
  ]
  const opcoesOrdem = [
    { valor: '', rotulo: 'Ordem alfabética' },
    { valor: 'nota', rotulo: 'Mais bem avaliados' },
    { valor: 'avaliacoes', rotulo: 'Mais avaliações' },
    ...(posicao ? [{ valor: 'distancia', rotulo: 'Mais perto' }] : []),
  ]

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        <span className="fb-mao">fuçando o cardápio da cidade</span>
        <h1 className="mt-1">Explorar</h1>
        <p className="fb-subtitulo mb-0">Encontre restaurantes por cozinha, preço, nota e localização.</p>

        <div className="fb-filtros">
          <Seletor rotulo="Cozinha" valor={filtros.categoriaId} opcoes={opcoesCategoria}
            aoMudar={(v) => mudarFiltro('categoriaId', v)} />
          <Seletor rotulo="Faixa de preço" valor={filtros.faixaPreco} opcoes={PRECOS}
            aoMudar={(v) => mudarFiltro('faixaPreco', v)} />
          <Seletor rotulo="Nota mínima" valor={filtros.notaMin} opcoes={NOTAS}
            aoMudar={(v) => mudarFiltro('notaMin', v)} />
          <Seletor rotulo="Ordenar por" valor={filtros.ordem} opcoes={opcoesOrdem}
            aoMudar={(v) => mudarFiltro('ordem', v)} />

          <button type="button" className={`fb-chip ${filtros.pets ? 'ativo' : ''}`} aria-pressed={filtros.pets}
            onClick={() => mudarFiltro('pets', !filtros.pets)}>
            Pet friendly
          </button>
          <button type="button" className={`fb-chip ${filtros.acessivel ? 'ativo' : ''}`}
            aria-pressed={filtros.acessivel} onClick={() => mudarFiltro('acessivel', !filtros.acessivel)}>
            Acessível
          </button>
          <button type="button" className={`fb-chip ${posicao ? 'ativo' : ''}`} aria-pressed={Boolean(posicao)}
            onClick={posicao ? deixarDeUsarLocalizacao : usarMinhaLocalizacao}>
            Perto de mim
          </button>
        </div>

        {filtros.busca && (
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <span className="fb-selo" style={{ background: 'var(--fb-creme)' }}>
              Buscando por “{filtros.busca}”
              <button type="button" className="fb-botao-texto ms-1" aria-label="Tirar a busca"
                onClick={() => mudarFiltro('busca', '')}>
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </span>
          </div>
        )}

        <div className="mt-4">
          <Aviso tipo="info">{avisoLocalizacao}</Aviso>
          <Aviso>{erro?.message}</Aviso>
        </div>

        {pessoas.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-3" style={{ fontSize: '1.5rem' }}>Pessoas</h2>
            <div className="fb-pessoas">
              {pessoas.map((p) => (
                <Link key={p.id} to={`/perfil/${p.username}`} className="fb-pessoa">
                  <Avatar nome={p.nome} foto={p.fotoPerfil} />
                  <span className="text-truncate">
                    <strong className="d-block text-truncate">{p.nome}</strong>
                    <span className="fb-cartao-meta">@{p.username}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {restaurantes === null && <p className="fb-vazio">Carregando restaurantes…</p>}

        {restaurantes !== null && !erro && (
          <>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <p className="fb-autor mb-0">
                {restaurantes.length} {restaurantes.length === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}
              </p>
              {temFiltro && (
                <button type="button" className="fb-ver-tudo fb-botao-texto" onClick={limpar}>
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="fb-explorar">
              {restaurantes.length === 0 ? (
                <p className="fb-vazio flex-grow-1">Nenhum restaurante encontrado com esses filtros.</p>
              ) : (
                <div className="fb-explorar-lista">
                  {restaurantes.map((r) => (
                    <CartaoRestaurante key={r.id} restaurante={r} destaque={r.id === destaqueId}
                      aoPassarMouse={() => setDestaqueId(r.id)} />
                  ))}
                </div>
              )}

              <aside className="fb-explorar-mapa">
                <MapaExplorar restaurantes={noMapa} destaqueId={destaqueId} aoEscolher={setDestaqueId} />
                <p className="fb-cartao-meta mt-2 ms-1">
                  Passe o mouse num cartão ou clique num pino para destacar o restaurante.
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
      <Rodape />
    </>
  )
}
