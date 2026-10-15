import { useEffect, useState } from 'react'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CartaoRestaurante from '../components/CartaoRestaurante.jsx'
import * as api from '../services/apiReal.js'

const FILTROS_INICIAIS = {
  busca: '', categoriaId: '', faixaPreco: '', notaMin: '', pets: false, acessivel: false, ordem: '',
}

export default function Explorar() {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS)
  const [posicao, setPosicao] = useState(null) 
  const [categorias, setCategorias] = useState([])
  const [restaurantes, setRestaurantes] = useState(null) 
  const [erro, setErro] = useState(null)
  const [avisoLocalizacao, setAvisoLocalizacao] = useState(null)

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

  function limpar() {
    setFiltros(FILTROS_INICIAIS)
    setPosicao(null)
    setAvisoLocalizacao(null)
  }

  const temFiltro = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIAIS) || posicao !== null

  return (
    <>
      <BarraNavegacao />
      <main className="container py-4">
        <h1>Explorar</h1>
        <p className="fb-subtitulo">Restaurantes, cozinhas ou bairros.</p>

        <div className="fb-campo fb-campo-busca">
          <i className="bi bi-search" aria-hidden="true"></i>
          <input
            type="search" placeholder="O que vai comer hoje?" aria-label="Buscar restaurantes"
            value={filtros.busca} onChange={(e) => mudarFiltro('busca', e.target.value)}
          />
        </div>

        <div className="fb-filtros">
          <select className="fb-seletor" aria-label="Categoria" value={filtros.categoriaId}
            onChange={(e) => mudarFiltro('categoriaId', e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          <select className="fb-seletor" aria-label="Faixa de preço" value={filtros.faixaPreco}
            onChange={(e) => mudarFiltro('faixaPreco', e.target.value)}>
            <option value="">Qualquer preço</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>

          <select className="fb-seletor" aria-label="Nota mínima" value={filtros.notaMin}
            onChange={(e) => mudarFiltro('notaMin', e.target.value)}>
            <option value="">Qualquer nota</option>
            <option value="3">Nota 3 ou mais</option>
            <option value="4">Nota 4 ou mais</option>
            <option value="4.5">Nota 4,5 ou mais</option>
          </select>

          <button type="button" className={`fb-chip ${filtros.pets ? 'ativo' : ''}`} aria-pressed={filtros.pets}
            onClick={() => mudarFiltro('pets', !filtros.pets)}>
            Pet friendly
          </button>
          <button type="button" className={`fb-chip ${filtros.acessivel ? 'ativo' : ''}`}
            aria-pressed={filtros.acessivel} onClick={() => mudarFiltro('acessivel', !filtros.acessivel)}>
            Acessível
          </button>
          <button type="button" className={`fb-chip ${posicao ? 'ativo' : ''}`} aria-pressed={Boolean(posicao)}
            onClick={posicao ? () => setPosicao(null) : usarMinhaLocalizacao}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i> Perto de mim
          </button>

          <select className="fb-seletor ms-md-auto" aria-label="Ordenar por" value={filtros.ordem}
            onChange={(e) => mudarFiltro('ordem', e.target.value)}>
            <option value="">Ordem alfabética</option>
            <option value="nota">Melhor nota</option>
            <option value="avaliacoes">Mais avaliados</option>
            {posicao && <option value="distancia">Mais perto</option>}
          </select>
        </div>

        <Aviso tipo="info">{avisoLocalizacao}</Aviso>
        <Aviso>{erro?.message}</Aviso>

        {restaurantes === null && <p className="fb-vazio">Carregando restaurantes…</p>}

        {restaurantes !== null && !erro && (
          <>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
              <h2 className="mb-0">
                {restaurantes.length} {restaurantes.length === 1 ? 'restaurante' : 'restaurantes'}
              </h2>
              {temFiltro && (
                <button type="button" className="fb-link-discreto fb-botao-texto" onClick={limpar}>
                  Limpar filtros
                </button>
              )}
            </div>

            {restaurantes.length === 0 ? (
              <p className="fb-vazio">Nenhum restaurante encontrado com esses filtros.</p>
            ) : (
              <div className="row g-3">
                {restaurantes.map((r) => (
                  <div key={r.id} className="col-sm-6 col-lg-4">
                    <CartaoRestaurante restaurante={r} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
