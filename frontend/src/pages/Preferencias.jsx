import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'

// "Tanto faz" é guardado como null 
const FAIXAS = [
  { valor: null, rotulo: 'Tanto faz' },
  { valor: '$', rotulo: '$' },
  { valor: '$$', rotulo: '$$' },
  { valor: '$$$', rotulo: '$$$' },
]

// quando o usuário pula a tela.
const PREFERENCIAS_VAZIAS = {
  categoriaIds: [], faixaPreco: null, precisaAcessibilidade: false, levaPets: false,
}

// Tela de preferências
export default function Preferencias() {
  const { usuario, logado } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const destino = local.state?.voltarPara || '/explorar'

  const [categorias, setCategorias] = useState([])
  const [dados, setDados] = useState(PREFERENCIAS_VAZIAS)
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  const podeUsar = logado && usuario?.papel === 'USUARIO'

  // Ao abrir: carrega as categorias e, se o usuário já tiver preferências, preenche a tela com elas.
  useEffect(() => {
    if (!podeUsar) {
      return
    }
    async function carregar() {
      try {
        setCategorias(await api.listarCategorias())
        try {
          setDados(await api.buscarPreferencias())
          setPrimeiroAcesso(false)
        } catch (falha) {
          if (falha.status !== 404) throw falha 
        }
      } catch (falha) {
        setErro(falha)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [podeUsar])

  // Visitante vai para o login; restaurante e admin não têm preferências.
  if (!logado) {
    return <Navigate to="/login" replace state={{ voltarPara: '/preferencias' }} />
  }
  if (!podeUsar) {
    return <Navigate to="/explorar" replace />
  }

  function alternarCategoria(id) {
    const marcadas = dados.categoriaIds.includes(id)
      ? dados.categoriaIds.filter((c) => c !== id)
      : [...dados.categoriaIds, id]
    setDados({ ...dados, categoriaIds: marcadas })
  }

  async function salvar(preferencias) {
    setErro(null)
    setEnviando(true)
    try {
      await api.salvarPreferencias(preferencias)
      navegar(destino, { replace: true })
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  return (
    <div className="fb-pagina-media fb-preferencias">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Link to="/explorar" className="fb-marca">
          <span className="fb-logo"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
          fourbites
        </Link>
        <span className="fb-subtitulo">Olá, <strong className="text-body">{usuario.nome.split(' ')[0]}</strong></span>
      </div>

      {primeiroAcesso && <span className="fb-selo-secao">Primeiro acesso</span>}
      <h1 className="mt-2">Conte o que você gosta</h1>
      <p className="fb-subtitulo">
        Usamos isso para calcular a compatibilidade e recomendar restaurantes. Você pode mudar depois.
      </p>

      <Aviso>{erro?.message}</Aviso>

      {carregando ? (
        <p className="fb-vazio">Carregando…</p>
      ) : (
        <>
          <section className="fb-cartao p-4 mt-4">
            <h2 className="fb-pergunta">Quais cozinhas você prefere?</h2>
            <p className="fb-ajuda ms-0 mb-3">Marque quantas quiser.</p>
            <div className="d-flex flex-wrap gap-2">
              {categorias.map((c) => {
                const marcada = dados.categoriaIds.includes(c.id)
                return (
                  <button key={c.id} type="button" aria-pressed={marcada}
                    className={`fb-opcao ${marcada ? 'ativo' : ''}`} onClick={() => alternarCategoria(c.id)}>
                    {marcada && <i className="bi bi-check-lg" aria-hidden="true"></i>} {c.nome}
                  </button>
                )
              })}
            </div>

            <h2 className="fb-pergunta mt-4 mb-3">Quanto costuma gastar?</h2>
            <div className="fb-segmentado" role="radiogroup" aria-label="Faixa de preço">
              {FAIXAS.map((f) => (
                <button key={f.rotulo} type="button" role="radio" aria-checked={dados.faixaPreco === f.valor}
                  className={dados.faixaPreco === f.valor ? 'ativo' : ''}
                  onClick={() => setDados({ ...dados, faixaPreco: f.valor })}>
                  {f.rotulo}
                </button>
              ))}
            </div>

            <div className="row g-3 mt-2">
              <div className="col-sm-6">
                <Interruptor icone="bi-universal-access" rotulo="Preciso de acessibilidade"
                  ligado={dados.precisaAcessibilidade}
                  aoMudar={(v) => setDados({ ...dados, precisaAcessibilidade: v })} />
              </div>
              <div className="col-sm-6">
                <Interruptor icone="bi-heart" rotulo="Costumo levar pets"
                  ligado={dados.levaPets}
                  aoMudar={(v) => setDados({ ...dados, levaPets: v })} />
              </div>
            </div>
          </section>

          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            {primeiroAcesso && (
              <button type="button" className="fb-botao fb-botao-claro" disabled={enviando}
                onClick={() => salvar(PREFERENCIAS_VAZIAS)}>
                Pular por enquanto
              </button>
            )}
            <button type="button" className="fb-botao fb-botao-principal flex-grow-1" disabled={enviando}
              onClick={() => salvar(dados)}>
              {enviando ? 'Salvando…' : primeiroAcesso ? 'Salvar e começar' : 'Salvar'}
              {!enviando && <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>}
            </button>
          </div>

          {primeiroAcesso && (
            <p className="fb-ajuda ms-0 mt-3">
              Se pular, mostramos os restaurantes mais bem avaliados até você ter preferências ou avaliações.
            </p>
          )}
        </>
      )}
    </div>
  )
}

function Interruptor({ icone, rotulo, ligado, aoMudar }) {
  const id = `pref-${icone}`
  return (
    <label htmlFor={id} className={`fb-interruptor ${ligado ? 'ativo' : ''}`}>
      <span className="fb-icone-suave"><i className={`bi ${icone}`} aria-hidden="true"></i></span>
      <span className="flex-grow-1 fw-bold">{rotulo}</span>
      <span className="form-check form-switch m-0">
        <input id={id} className="form-check-input" type="checkbox" role="switch"
          checked={ligado} onChange={(e) => aoMudar(e.target.checked)} />
      </span>
    </label>
  )
}
