import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Estrelas from '../components/Estrelas.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { agruparHorarios, estaAberto, formatarData, formatarNota, iniciais } from '../utils/formatos.js'

export default function Restaurante() {
  const { id } = useParams()
  const local = useLocation()
  const { usuario, logado } = useAuth()

  const [restaurante, setRestaurante] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let cancelada = false
    Promise.all([api.buscarRestaurante(id), api.listarAvaliacoesDoRestaurante(id)])
      .then(([perfil, lista]) => {
        if (!cancelada) {
          setRestaurante(perfil)
          setAvaliacoes(lista)
          setErro(null)
        }
      })
      .catch((falha) => !cancelada && setErro(falha))
    return () => {
      cancelada = true
    }
  }, [id, usuario?.id])

  if (erro) {
    return (
      <>
        <BarraNavegacao />
        <main className="container py-5">
          <Aviso>{erro.message}</Aviso>
          <Link to="/explorar" className="fb-link">Voltar para a busca</Link>
        </main>
      </>
    )
  }

  if (!restaurante) {
    return (
      <>
        <BarraNavegacao />
        <main className="container py-5"><p className="fb-vazio">Carregando…</p></main>
      </>
    )
  }

  const r = restaurante
  const aberto = estaAberto(r.horarios)
  const podeAvaliar = usuario?.papel === 'USUARIO'
  const mapa = `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`

  return (
    <>
      <BarraNavegacao />
      <main className="container py-4">
        {r.fotos.length > 0 ? (
          <div className={`fb-galeria fb-galeria-${Math.min(r.fotos.length, 3)}`}>
            {r.fotos.slice(0, 3).map((url) => <img key={url} src={url} alt="" />)}
          </div>
        ) : (
          <div className="fb-galeria-vazia"><i className="bi bi-fork-knife" aria-hidden="true"></i></div>
        )}

        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mt-4">
          <div>
            <h1 className="mb-1">{r.nome}</h1>
            <p className="fb-subtitulo mb-2">
              {r.categoria?.nome} · {r.faixaPreco} · {r.bairro}, {r.cidade} · Desde {r.dataFundacao.slice(0, 4)}
            </p>
            <div className="d-flex flex-wrap gap-2">
              {r.horarios.length > 0 && (
                <span className={`fb-etiqueta ${aberto ? 'fb-etiqueta-verde' : 'fb-etiqueta-cinza'}`}>
                  {aberto ? 'Aberto agora' : 'Fechado agora'}
                </span>
              )}
              {r.aceitaPets && <span className="fb-etiqueta">Pet friendly</span>}
              {r.acessivel && <span className="fb-etiqueta">Acessível</span>}
            </div>
          </div>

          <div className="text-md-end">
            <div className="fb-nota-grande">
              <i className="bi bi-star-fill" aria-hidden="true"></i> {formatarNota(r.notaMedia)}
            </div>
            <div className="fb-cartao-meta mb-2">
              {r.totalAvaliacoes === 0
                ? 'Ainda sem avaliações'
                : `${r.totalAvaliacoes} ${r.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
            </div>

            {podeAvaliar && (
              <Link to={`/restaurantes/${r.id}/avaliar`} className="fb-botao fb-botao-principal">
                <i className="bi bi-star" aria-hidden="true"></i>{' '}
                {r.minhaAvaliacaoId ? 'Editar minha avaliação' : 'Avaliar'}
              </Link>
            )}
            {!logado && (
              <Link to="/login" state={{ voltarPara: local.pathname }} className="fb-botao fb-botao-claro">
                Entre para avaliar
              </Link>
            )}
          </div>
        </div>

        {logado && !podeAvaliar && (
          <Aviso tipo="info">Avaliar é exclusivo para contas de usuário. Você está só visualizando.</Aviso>
        )}

        <div className="row g-4 mt-1">
          <div className="col-lg-8">
            <section className="fb-cartao p-4 mb-3">
              <h2>Sobre</h2>
              <p className="mb-0">{r.descricao}</p>
            </section>

            {r.medias && (
              <section className="fb-cartao p-4 mb-3">
                <h2>Notas por categoria</h2>
                <div className="row g-3">
                  {[
                    ['Comida', r.medias.comida],
                    ['Atendimento', r.medias.atendimento],
                    ['Ambiente', r.medias.ambiente],
                    ['Custo-benefício', r.medias.custo],
                  ].map(([nome, nota]) => (
                    <div key={nome} className="col-sm-6">
                      <div className="d-flex justify-content-between">
                        <span>{nome}</span>
                        <strong>{formatarNota(nota)}</strong>
                      </div>
                      <div className="fb-barra-nota"><span style={{ width: `${(nota / 5) * 100}%` }}></span></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <h2 className="mt-4">
              Avaliações <span className="fb-contagem">({avaliacoes.length})</span>
            </h2>

            {avaliacoes.length === 0 && (
              <p className="fb-vazio">Ninguém avaliou este restaurante ainda. Seja a primeira pessoa!</p>
            )}

            {avaliacoes.map((a) => (
              <article key={a.id} className="fb-cartao p-3 mb-3 d-flex gap-3">
                <span className="fb-avatar">{iniciais(a.usuario.nome)}</span>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <strong>{a.usuario.nome}</strong>
                      <div className="fb-cartao-meta">
                        @{a.usuario.username} · {formatarData(a.dataAvaliacao)}{a.editada && ' · editada'}
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="fb-nota-avaliacao">{formatarNota(a.notaGeral, 2)}</span>
                      <span className="fb-cartao-meta"> / 5</span>
                      <div><Estrelas valor={a.notaGeral} /></div>
                    </div>
                  </div>
                  <div className="fb-cartao-meta mt-1">
                    Comida {a.notaComida} · Ambiente {a.notaAmbiente} · Atendimento {a.notaAtendimento} ·
                    Custo-benefício {a.notaCusto}
                  </div>
                  {a.comentario && <p className="mt-2 mb-0">{a.comentario}</p>}
                  {a.fotos.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {a.fotos.map((url) => <img key={url} src={url} alt="" className="fb-foto-avaliacao" />)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <aside className="col-lg-4">
            <section className="fb-cartao p-4 mb-3">
              <ul className="fb-lista-info">
                <li>
                  <i className="bi bi-geo-alt" aria-hidden="true"></i>
                  <span>
                    {r.endereco.logradouro}, {r.endereco.numero}
                    {r.endereco.complemento && ` (${r.endereco.complemento})`} · {r.endereco.bairro} ·{' '}
                    {r.endereco.cidade}/{r.endereco.uf}
                    <br />
                    <a href={mapa} target="_blank" rel="noreferrer" className="fb-link">Ver no mapa</a>
                  </span>
                </li>
                <li><i className="bi bi-telephone" aria-hidden="true"></i><span>{r.telefone}</span></li>
                {r.formasPagamento.length > 0 && (
                  <li>
                    <i className="bi bi-credit-card" aria-hidden="true"></i>
                    <span>{r.formasPagamento.map((f) => f.nome).join(', ')}</span>
                  </li>
                )}
              </ul>
            </section>

            {r.horarios.length > 0 && (
              <section className="fb-cartao p-4 mb-3">
                <h2>Horário de funcionamento</h2>
                <table className="fb-horarios">
                  <tbody>
                    {agruparHorarios(r.horarios).map((linha) => (
                      <tr key={linha.dia}>
                        <th scope="row">{linha.dia}</th>
                        <td>{linha.periodos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {(r.cardapioUrl || r.cardapioLink) && (
              <section className="fb-cartao p-4 mb-3">
                <h2>Cardápio</h2>
                {r.cardapioUrl && (
                  <a href={r.cardapioUrl} target="_blank" rel="noreferrer" className="fb-botao fb-botao-suave w-100">
                    <i className="bi bi-file-earmark-text" aria-hidden="true"></i> Ver cardápio
                  </a>
                )}
                {r.cardapioLink && (
                  <a href={r.cardapioLink} target="_blank" rel="noreferrer" className="fb-link d-block text-center mt-2">
                    <i className="bi bi-link-45deg" aria-hidden="true"></i> Abrir link externo
                  </a>
                )}
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}