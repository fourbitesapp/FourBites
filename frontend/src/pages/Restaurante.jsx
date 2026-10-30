import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CartaoAvaliacao from '../components/CartaoAvaliacao.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import JanelaFavoritosCheia from '../components/JanelaFavoritosCheia.jsx'
import MapaRestaurante from '../components/MapaRestaurante.jsx'
import Rodape from '../components/Rodape.jsx'
import SeloCompatibilidade from '../components/SeloCompatibilidade.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { agruparHorarios, estaAberto, formatarNota } from '../utils/formatos.js'
import { CARACTERISTICAS } from '../utils/restaurantes.js'
import { temRecursosDeUsuario } from '../utils/papeis.js'

// Perfil do restaurante: fotos, notas, avaliações e, ao lado, mapa, horário e cardápio.
export default function Restaurante() {
  const { id } = useParams()
  const local = useLocation()
  const { usuario, logado } = useAuth()

  const [restaurante, setRestaurante] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [erro, setErro] = useState(null)
  const [favoritosCheios, setFavoritosCheios] = useState(null) // lista atual, quando a janela de substituir está aberta
  const [erroFavorito, setErroFavorito] = useState(null)
  const [salvandoFavorito, setSalvandoFavorito] = useState(false)

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
        <main className="fb-conteudo">
          <Aviso>{erro.message}</Aviso>
          <Link to="/explorar" className="fb-link">Voltar para a busca</Link>
        </main>
        <Rodape />
      </>
    )
  }

  if (!restaurante) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-conteudo"><p className="fb-vazio">Carregando…</p></main>
      </>
    )
  }

  const r = restaurante

  // Favoritar: vai para a primeira posição livre; se as 4 estiverem ocupadas, abre a janela para escolher quem sai.
  // Se já é favorito, o botão tira dos favoritos.
  async function alternarFavorito() {
    setErroFavorito(null)
    setSalvandoFavorito(true)
    try {
      if (r.favoritoPosicao) {
        await api.removerFavorito(r.favoritoPosicao)
        setRestaurante({ ...r, favoritoPosicao: null })
        return
      }
      const meus = await api.listarMeusFavoritos()
      const livre = [1, 2, 3, 4].find((p) => !meus.some((f) => f.posicao === p))
      if (livre) {
        await api.colocarFavorito(livre, r.id)
        setRestaurante({ ...r, favoritoPosicao: livre })
      } else {
        setFavoritosCheios(meus)
      }
    } catch (falha) {
      setErroFavorito(falha.message)
    } finally {
      setSalvandoFavorito(false)
    }
  }

  async function substituirFavorito(posicao) {
    setSalvandoFavorito(true)
    try {
      await api.colocarFavorito(posicao, r.id)
      setRestaurante({ ...r, favoritoPosicao: posicao })
      setFavoritosCheios(null)
    } catch (falha) {
      setErroFavorito(falha.message)
      setFavoritosCheios(null)
    } finally {
      setSalvandoFavorito(false)
    }
  }
  const aberto = estaAberto(r.horarios)
  const podeAvaliar = temRecursosDeUsuario(usuario)
  const mapa = `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        {r.fotos.length > 0 ? (
          <div className={`fb-galeria fb-galeria-${Math.min(r.fotos.length, 3)}`}>
            {r.fotos.slice(0, 3).map((url) => <img key={url} src={url} alt="" />)}
          </div>
        ) : (
          <div className="fb-galeria-vazia" style={{ background: corDaCozinha(r.categoria) }}>
            <IconeCozinha nome={r.categoria?.nome} icone={r.categoria?.icone} tamanho={110} />
          </div>
        )}

        {/* Cabeçalho */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-4 mt-5">
          <div style={{ flex: '1 1 480px' }}>
            <h1 className="mb-2">{r.nome}</h1>
            <p className="fb-subtitulo fb-apagado mb-3">
              {r.categoria?.nome} · {r.faixaPreco} · {r.bairro}, {r.cidade}{r.dataFundacao && ` · Desde ${r.dataFundacao.slice(0, 4)}`}
            </p>
            <div className="d-flex flex-wrap gap-2">
              {r.horarios.length > 0 && (
                <span className={`fb-etiqueta ${aberto ? 'fb-etiqueta-verde' : 'fb-etiqueta-cinza'}`}>
                  <i className="bi bi-clock" aria-hidden="true"></i>{aberto ? 'Aberto agora' : 'Fechado agora'}
                </span>
              )}
              {CARACTERISTICAS.filter((c) => r[c.campo]).map((c) => (
                <span key={c.campo} className="fb-etiqueta" style={{ background: c.cor }}>
                  <i className={`bi ${c.icone}`} aria-hidden="true"></i>{c.rotulo}
                </span>
              ))}
            </div>
          </div>

          <div className="fb-restaurante-resumo d-flex flex-column align-items-md-end gap-3">
            <div className="fb-restaurante-notas d-flex flex-wrap align-items-center gap-3">
              {r.compatibilidade !== null && r.compatibilidade !== undefined && (
                <SeloCompatibilidade valor={r.compatibilidade} />
              )}
              <div className="text-md-end">
                <div className="fb-nota-grande">
                  <i className="bi bi-star-fill" aria-hidden="true"></i> {formatarNota(r.notaMedia)}
                </div>
                <div className="fb-cartao-meta">
                  {r.totalAvaliacoes === 0
                    ? 'Ainda sem avaliações'
                    : `${r.totalAvaliacoes} ${r.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
                </div>
              </div>
            </div>

            {podeAvaliar && (
              <div className="fb-acoes-restaurante ms-md-auto">
                <button type="button" className="fb-botao fb-botao-contorno" onClick={alternarFavorito}
                  disabled={salvandoFavorito} aria-pressed={Boolean(r.favoritoPosicao)}>
                  <i className={r.favoritoPosicao ? 'bi bi-heart-fill' : 'bi bi-heart'} aria-hidden="true"></i>
                  {r.favoritoPosicao ? 'Nos favoritos' : 'Favoritar'}
                </button>
                <Link to={`/restaurantes/${r.id}/avaliar`} className="fb-botao fb-botao-principal">
                  {r.minhaAvaliacaoId ? 'Editar avaliação' : 'Avaliar'}
                </Link>
              </div>
            )}
            {erroFavorito && <div className="fb-erro-campo">{erroFavorito}</div>}
            {!logado && (
              <Link to="/login" state={{ voltarPara: local.pathname }} className="fb-botao fb-botao-principal">
                Entre para avaliar
              </Link>
            )}
          </div>
        </div>

        {logado && !podeAvaliar && (
          <div className="mt-4">
            <Aviso tipo="info">Avaliar é exclusivo para contas de usuário. Você está só visualizando.</Aviso>
          </div>
        )}

        <div className="row g-4 g-lg-5 mt-2">
          {/* Coluna principal */}
          <div className="col-lg-8 d-flex flex-column gap-4">
            <section className="fb-caixa">
              <h2 style={{ fontSize: '1.65rem' }}>Sobre</h2>
              <p className="mb-0" style={{ color: 'var(--fb-tinta)', fontSize: '1.05rem' }}>{r.descricao}</p>
            </section>

            {r.medias && (
              <section className="fb-caixa">
                <h2 className="mb-4" style={{ fontSize: '1.65rem' }}>Notas por categoria</h2>
                <div className="row g-4">
                  {[
                    ['Comida', r.medias.comida],
                    ['Atendimento', r.medias.atendimento],
                    ['Ambiente', r.medias.ambiente],
                    ['Custo-benefício', r.medias.custo],
                  ].map(([nome, nota]) => (
                    <div key={nome} className="col-sm-6">
                      <div className="d-flex justify-content-between fb-autor">
                        <span>{nome}</span>
                        <span>{formatarNota(nota)}</span>
                      </div>
                      <div className="fb-barra-nota"><span style={{ width: `${(nota / 5) * 100}%` }}></span></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-2">
              <h2 className="mb-4">
                Avaliações <span className="fb-contagem">({avaliacoes.length})</span>
              </h2>

              {avaliacoes.length === 0 && (
                <p className="fb-vazio">Ninguém avaliou este restaurante ainda. Seja a primeira pessoa!</p>
              )}
              {avaliacoes.map((a) => <CartaoAvaliacao key={a.id} avaliacao={a} mostrarRestaurante={false} />)}
            </section>
          </div>

          {/* Coluna lateral */}
          <aside className="col-lg-4 d-flex flex-column gap-4">
            <section className="fb-cartao overflow-hidden">
              <MapaRestaurante latitude={r.latitude} longitude={r.longitude} nome={r.nome} />
              <ul className="fb-lista-info p-4">
                <li>
                  <i className="bi bi-geo-alt" aria-hidden="true"></i>
                  <span>
                    {r.endereco.logradouro}, {r.endereco.numero}
                    {r.endereco.complemento && ` (${r.endereco.complemento})`} · {r.endereco.bairro} ·{' '}
                    {r.endereco.cidade}/{r.endereco.uf}
                    <br />
                    <a href={mapa} target="_blank" rel="noreferrer" className="fb-link">Abrir mapa maior</a>
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
              <section className="fb-caixa">
                <h2 className="mb-3" style={{ fontSize: '1.4rem' }}>Horário de funcionamento</h2>
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
              <section className="fb-caixa" style={{ background: 'var(--fb-creme)' }}>
                <h2 className="mb-3" style={{ fontSize: '1.4rem' }}>Cardápio</h2>
                {r.cardapioUrl && (
                  <a href={r.cardapioUrl} target="_blank" rel="noreferrer" className="fb-botao fb-botao-amarelo w-100">
                    Ver cardápio
                  </a>
                )}
                {r.cardapioLink && (
                  <a href={r.cardapioLink} target="_blank" rel="noreferrer" className="fb-link fw-bold d-block text-center mt-3">
                    Abrir link externo
                  </a>
                )}
              </section>
            )}
          </aside>
        </div>
      </main>
      <Rodape />

      {favoritosCheios && (
        <JanelaFavoritosCheia novo={r} favoritos={favoritosCheios} enviando={salvandoFavorito}
          aoConfirmar={substituirFavorito} aoFechar={() => setFavoritosCheios(null)} />
      )}
    </>
  )
}