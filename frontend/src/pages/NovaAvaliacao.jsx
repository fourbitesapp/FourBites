import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Estrelas from '../components/Estrelas.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { formatarNota } from '../utils/formatos.js'

const CATEGORIAS = [
  ['notaComida', 'Comida', 'bi-fork-knife'],
  ['notaAmbiente', 'Ambiente', 'bi-shop'],
  ['notaAtendimento', 'Atendimento', 'bi-bell'],
  ['notaCusto', 'Custo-benefício', 'bi-coin'],
]

export default function NovaAvaliacao() {
  const { id } = useParams()
  const local = useLocation()
  const navegar = useNavigate()
  const { usuario, logado } = useAuth()

  const [restaurante, setRestaurante] = useState(null)
  const [avaliacaoId, setAvaliacaoId] = useState(null) 
  const [notas, setNotas] = useState({ notaComida: 0, notaAmbiente: 0, notaAtendimento: 0, notaCusto: 0 })
  const [comentario, setComentario] = useState('')
  const [fotos, setFotos] = useState([]) 
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!logado) {
      return
    }
    let cancelada = false

    async function carregar() {
      const perfil = await api.buscarRestaurante(id)
      const existente = perfil.minhaAvaliacaoId ? await api.buscarAvaliacao(perfil.minhaAvaliacaoId) : null
      if (cancelada) {
        return
      }
      setRestaurante(perfil)
      if (existente) {
        setAvaliacaoId(existente.id)
        setNotas({
          notaComida: existente.notaComida,
          notaAmbiente: existente.notaAmbiente,
          notaAtendimento: existente.notaAtendimento,
          notaCusto: existente.notaCusto,
        })
        setComentario(existente.comentario || '')
        setFotos(existente.fotos)
      }
    }

    carregar().catch((falha) => !cancelada && setErro(falha))
    return () => {
      cancelada = true
    }
  }, [id, logado])

  if (!logado) {
    return <Navigate to="/login" state={{ voltarPara: local.pathname }} replace />
  }

  const editando = avaliacaoId !== null
  const todasMarcadas = Object.values(notas).every((nota) => nota > 0)
  const notaGeral = todasMarcadas ? Object.values(notas).reduce((soma, nota) => soma + nota, 0) / 4 : null

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const dados = { ...notas, comentario, fotos }
      if (editando) {
        await api.editarAvaliacao(avaliacaoId, dados)
      } else {
        await api.criarAvaliacao(id, dados)
      }
      navegar(`/restaurantes/${id}`)
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  return (
    <>
      <BarraNavegacao />
      <main className="fb-pagina-media">
        <h1>{editando ? 'Editar post' : 'Novo post'}</h1>
        <p className="fb-subtitulo">Conte como foi sua experiência.</p>

        {usuario.papel !== 'USUARIO' ? (
          <Aviso tipo="info">Avaliar é exclusivo para contas de usuário.</Aviso>
        ) : !restaurante ? (
          erro ? <Aviso>{erro.message}</Aviso> : <p className="fb-vazio">Carregando…</p>
        ) : (
          <form onSubmit={aoEnviar}>
            <Aviso>{erro?.message}</Aviso>

            <section className="fb-cartao p-4 mb-3">
              <h2>Restaurante</h2>
              <div className="fb-restaurante-escolhido">
                {restaurante.fotoCapa ? (
                  <img src={restaurante.fotoCapa} alt="" />
                ) : (
                  <span className="fb-sem-foto"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
                )}
                <div>
                  <strong>{restaurante.nome}</strong>
                  <div className="fb-cartao-meta">
                    {restaurante.categoria?.nome} · {restaurante.bairro}, {restaurante.cidade}
                  </div>
                </div>
              </div>
            </section>

            <section className="fb-cartao p-4 mb-3">
              <h2>Notas</h2>
              <div className="row g-3 align-items-stretch">
                <div className="col-md-8">
                  {CATEGORIAS.map(([campo, nome, icone]) => (
                    <div key={campo} className="fb-linha-nota">
                      <span className="fb-linha-nota-nome">
                        <i className={`bi ${icone}`} aria-hidden="true"></i> {nome}
                      </span>
                      <Estrelas valor={notas[campo]} rotulo={nome}
                        aoMudar={(nota) => setNotas({ ...notas, [campo]: nota })} />
                      <strong className="fb-linha-nota-valor">{notas[campo] || '–'}</strong>
                      {erro?.campos[campo] && <div className="fb-erro-campo w-100">{erro.campos[campo]}</div>}
                    </div>
                  ))}
                </div>
                <div className="col-md-4">
                  <div className="fb-nota-geral">
                    <span className="fb-nota-geral-rotulo">Nota geral</span>
                    <span className="fb-nota-geral-valor">{formatarNota(notaGeral, 2)}</span>
                    <span>de 5</span>
                    <small>Média das 4 notas, calculada automaticamente</small>
                  </div>
                </div>
              </div>
            </section>

            <section className="fb-cartao p-4 mb-3">
              <h2 className="mb-0"><label htmlFor="comentario">Comentário</label></h2>
              <div className="fb-ajuda mb-2">Opcional</div>
              <textarea
                id="comentario" className="fb-area-texto" rows="4" maxLength="2000"
                value={comentario} onChange={(e) => setComentario(e.target.value)}
              ></textarea>
              {erro?.campos.comentario && <div className="fb-erro-campo">{erro.campos.comentario}</div>}
            </section>

            <div className="d-flex justify-content-end gap-2">
              <Link to={`/restaurantes/${id}`} className="fb-botao fb-botao-claro">Cancelar</Link>
              <button type="submit" className="fb-botao fb-botao-principal" disabled={!todasMarcadas || enviando}>
                {enviando ? 'Publicando…' : editando ? 'Salvar alterações' : 'Publicar'}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  )
}
