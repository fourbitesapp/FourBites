import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Avatar from '../components/Avatar.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import CapaPerfil from '../components/CapaPerfil.jsx'
import IconeCozinha from '../components/IconeCozinha.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { corDaCozinha } from '../utils/cozinhas.js'
import { formatarNota } from '../utils/formatos.js'

const POSICOES = [1, 2, 3, 4]

// /perfil leva para o perfil de quem está logado.
export function MeuPerfil() {
  const { usuario, logado } = useAuth()
  if (!logado) {
    return <Navigate to="/login" replace state={{ voltarPara: '/perfil' }} />
  }
  return <Navigate to={`/perfil/${usuario.username}`} replace />
}

// Perfil de um usuário: o próprio (com edição) ou o de outra pessoa (com o botão Seguir).
export default function Perfil() {
  const { username } = useParams()
  const { usuario, logado, sair } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [perfil, setPerfil] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [preferencias, setPreferencias] = useState(null) // só no próprio perfil
  const [categorias, setCategorias] = useState([])
  const [erro, setErro] = useState(null)
  const [erroSeguir, setErroSeguir] = useState(null)
  const [seguindoAgora, setSeguindoAgora] = useState(false)

  const ehMeuPerfil = logado && usuario.username.toLowerCase() === username.toLowerCase()
  const podeSeguir = logado && usuario.papel === 'USUARIO' && !ehMeuPerfil

  useEffect(() => {
    let cancelada = false
    setPerfil(null)
    setErro(null)

    Promise.all([api.buscarPerfil(username), api.listarFavoritosDoUsuario(username), api.listarAvaliacoesDoUsuario(username)])
      .then(([dados, favs, lista]) => {
        if (!cancelada) {
          setPerfil(dados)
          setFavoritos(favs)
          setAvaliacoes(lista)
        }
      })
      .catch((falha) => !cancelada && setErro(falha))

    // O resumo de preferências só aparece para o dono do perfil (conta USUARIO).
    if (ehMeuPerfil && usuario.papel === 'USUARIO') {
      api.listarCategorias().then((lista) => !cancelada && setCategorias(lista)).catch(() => {})
      api.buscarPreferencias()
        .then((dados) => !cancelada && setPreferencias(dados))
        .catch(() => !cancelada && setPreferencias(null)) // 404 = ainda não definiu
    }
    return () => {
      cancelada = true
    }
  }, [username, ehMeuPerfil, usuario?.papel])

  async function alternarSeguir() {
    setErroSeguir(null)
    setSeguindoAgora(true)
    try {
      if (perfil.seguidoPorMim) {
        await api.deixarDeSeguir(perfil.username)
        setPerfil({ ...perfil, seguidoPorMim: false, seguidores: perfil.seguidores - 1 })
      } else {
        await api.seguir(perfil.username)
        setPerfil({ ...perfil, seguidoPorMim: true, seguidores: perfil.seguidores + 1 })
      }
    } catch (falha) {
      setErroSeguir(falha.message)
    } finally {
      setSeguindoAgora(false)
    }
  }

  function aoSair() {
    sair()
    navegar('/')
  }

  if (erro) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-conteudo">
          <Aviso>{erro.status === 404 ? 'Este perfil não existe.' : erro.message}</Aviso>
          <Link to="/" className="fb-link">Voltar para o início</Link>
        </main>
        <Rodape />
      </>
    )
  }

  if (!perfil) {
    return (
      <>
        <BarraNavegacao />
        <main className="fb-conteudo"><p className="fb-vazio">Carregando…</p></main>
      </>
    )
  }

  const favoritoNa = (posicao) => favoritos.find((f) => f.posicao === posicao)
  const minhasCozinhas = (preferencias?.categoriaIds || [])
    .map((id) => categorias.find((c) => c.id === id))
    .filter(Boolean)
  const ehUsuarioDono = ehMeuPerfil && usuario.papel === 'USUARIO'

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        {/* Capa: cor e frase escolhidas pelo usuário no Editar perfil */}
        <CapaPerfil cor={perfil.capaCor} frase={perfil.capaFrase} />

        <div className="fb-perfil-topo">
          <Avatar nome={perfil.nome} foto={perfil.fotoPerfil} tamanho="perfil" />
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            {ehUsuarioDono && (
              <Link to="/novo-post" className="fb-botao fb-botao-principal">Nova publicação</Link>
            )}
            {ehMeuPerfil && (
              <>
                <Link to="/perfil/editar" className="fb-botao fb-botao-claro">Editar perfil</Link>
                <button type="button" className="fb-botao fb-botao-claro" onClick={aoSair}>Sair</button>
              </>
            )}
            {podeSeguir && (
              <button type="button" disabled={seguindoAgora} onClick={alternarSeguir}
                className={`fb-botao ${perfil.seguidoPorMim ? 'fb-botao-claro' : 'fb-botao-principal'}`}>
                {perfil.seguidoPorMim ? (
                  <><i className="bi bi-check-lg" aria-hidden="true"></i> Seguindo</>
                ) : 'Seguir'}
              </button>
            )}
            {!logado && (
              <Link to="/login" state={{ voltarPara: local.pathname }} className="fb-botao fb-botao-principal">
                Entre para seguir
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3 px-sm-4">
          <h1 className="mb-0">{perfil.nome}</h1>
          <p className="fb-autor fb-apagado mb-0">@{perfil.username}</p>
          {perfil.bio && <p className="mt-2 mb-0" style={{ color: 'var(--fb-tinta)', fontSize: '1.05rem' }}>{perfil.bio}</p>}
          <div className="mt-2"><Aviso>{erroSeguir}</Aviso></div>
        </div>

        <section className="fb-perfil-numeros">
          <div style={{ background: 'var(--fb-amarelo-claro)' }}><strong>{perfil.totalAvaliacoes}</strong><span>Posts</span></div>
          <div style={{ background: 'var(--fb-rosa-claro)' }}><strong>{perfil.seguidores}</strong><span>Seguidores</span></div>
          <div style={{ background: 'var(--fb-verde-claro)' }}><strong>{perfil.seguindo}</strong><span>Seguindo</span></div>
        </section>

        {/* Preferências: o "Ajustar preferências" fica aqui e abre a tela de Preferências */}
        {ehUsuarioDono && (
          <section className="fb-perfil-preferencias">
            <div className="d-flex flex-column gap-3" style={{ flex: '1 1 420px' }}>
              <div>
                <h2 className="mb-1" style={{ fontSize: '1.65rem' }}>Minhas preferências</h2>
                <p className="mb-0">Usadas para calcular a compatibilidade e as recomendações.</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {preferencias ? (
                  <>
                    {minhasCozinhas.map((c) => (
                      <span key={c.id} className="fb-pilula" style={{ background: corDaCozinha(c.id) }}>{c.nome}</span>
                    ))}
                    {preferencias.faixaPreco && <span className="fb-pilula">{preferencias.faixaPreco}</span>}
                    {preferencias.precisaAcessibilidade && <span className="fb-pilula">Acessibilidade</span>}
                    {preferencias.levaPets && <span className="fb-pilula">Leva pets</span>}
                    {minhasCozinhas.length === 0 && !preferencias.faixaPreco &&
                      !preferencias.precisaAcessibilidade && !preferencias.levaPets && (
                      <span className="fb-apagado">Nenhuma marcada</span>
                    )}
                  </>
                ) : (
                  <span className="fb-apagado">Ainda não definidas</span>
                )}
              </div>
            </div>
            <Link to="/preferencias" state={{ voltarPara: '/perfil' }} className="fb-botao fb-botao-amarelo">
              Ajustar preferências
            </Link>
          </section>
        )}

        {/* Favoritos */}
        <section className="fb-secao" style={{ marginTop: '4rem' }}>
          <div className="fb-secao-topo">
            <h2 className="mb-0">Restaurantes favoritos</h2>
            {ehUsuarioDono && <Link to="/perfil/favoritos" className="fb-ver-tudo">Gerenciar favoritos</Link>}
          </div>

          {favoritos.length === 0 ? (
            <p className="fb-vazio">
              {ehMeuPerfil
                ? 'Você ainda não tem favoritos. Abra um restaurante e toque em Favoritar.'
                : 'Nenhum restaurante favorito ainda.'}
            </p>
          ) : (
            <div className="row g-4">
              {POSICOES.map((posicao) => favoritoNa(posicao)).filter(Boolean).map((f) => (
                <div key={f.posicao} className="col-sm-6 col-lg-3">
                  <Link to={`/restaurantes/${f.restaurante.id}`} className="fb-cartao-restaurante">
                    <div className="fb-favorito-foto" style={{ background: corDaCozinha(f.restaurante.categoria?.id) }}>
                      {f.restaurante.fotoCapa
                        ? <img src={f.restaurante.fotoCapa} alt="" />
                        : <span className="fb-sem-foto"><IconeCozinha nome={f.restaurante.categoria?.nome} tamanho={40} /></span>}
                      <span className="fb-numero-favorito">{f.posicao}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-start gap-2 pt-3 px-2 pb-1">
                      <div>
                        <h3 className="fb-cartao-titulo" style={{ fontSize: '1.2rem' }}>{f.restaurante.nome}</h3>
                        <div className="fb-cartao-meta mt-0">{f.restaurante.categoria?.nome}</div>
                      </div>
                      <span className="fb-nota">★ {formatarNota(f.restaurante.notaMedia)}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Posts */}
        <section style={{ marginTop: '4rem' }}>
          <h2 className="mb-4">Posts recentes</h2>
          <div className="row g-3 g-lg-4">
            {ehUsuarioDono && (
              <div className="col-6 col-md-4 col-lg-3 col-xl">
                <Link to="/novo-post" className="fb-post fb-post-novo">
                  <span className="fb-icone-suave"><i className="bi bi-plus-lg" aria-hidden="true"></i></span>
                  <strong style={{ fontFamily: 'var(--fb-titulo)', fontSize: '1.1rem' }}>Nova publicação</strong>
                  <small>Avalie um restaurante que você visitou</small>
                </Link>
              </div>
            )}
            {avaliacoes.map((a) => {
              const foto = a.fotos[0] || a.restaurante.fotoCapa
              return (
                <div key={a.id} className="col-6 col-md-4 col-lg-3 col-xl">
                  <Link to={`/restaurantes/${a.restaurante.id}`} className="fb-post"
                    style={{ background: corDaCozinha(a.restaurante.categoria?.id) }}>
                    {foto
                      ? <img src={foto} alt="" />
                      : <span className="fb-sem-foto pb-5"><IconeCozinha nome={a.restaurante.categoria?.nome} tamanho={40} /></span>}
                    <span className="fb-post-nota">{formatarNota(a.notaGeral, 2)}</span>
                    <span className="fb-post-nome">{a.restaurante.nome}</span>
                  </Link>
                </div>
              )
            })}
          </div>
          {avaliacoes.length === 0 && !ehMeuPerfil && <p className="fb-vazio">Nenhum post ainda.</p>}
        </section>
      </main>
      <Rodape />
    </>
  )
}
