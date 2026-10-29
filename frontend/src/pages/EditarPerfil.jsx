import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Avatar from '../components/Avatar.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Campo from '../components/Campo.jsx'
import CapaPerfil from '../components/CapaPerfil.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { CORES_DE_CAPA, FRASES_DE_CAPA } from '../utils/capas.js'
import { conferirImagem, erroDeValidacao, temErros, validarDadosPessoais } from '../utils/validacoes.js'

// Editar perfil: foto, capa (cor e frase prontas) e dados pessoais (e-mail travado).
// As preferências ficam na tela própria, aberta pelo botão "Ajustar preferências" do perfil.
export default function EditarPerfil() {
  const { logado, atualizarUsuario } = useAuth()
  const navegar = useNavigate()
  const seletorDeFoto = useRef(null)

  const [dados, setDados] = useState(null) // { nome, username, bio, telefone, email, fotoPerfil }
  const [erro, setErro] = useState(null)
  const [erroFoto, setErroFoto] = useState(null)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!logado) {
      return
    }
    let cancelada = false
    async function carregar() {
      const meus = await api.buscarMeusDados()
      if (cancelada) return
      setDados({ ...meus, bio: meus.bio || '', capaCor: meus.capaCor || 'vermelha', capaFrase: meus.capaFrase || 'come-bem' })
    }
    carregar().catch((falha) => !cancelada && setErro(falha))
    return () => {
      cancelada = true
    }
  }, [logado])

  if (!logado) {
    return <Navigate to="/login" replace state={{ voltarPara: '/perfil/editar' }} />
  }

  function aoDigitar(evento) {
    setDados({ ...dados, [evento.target.name]: evento.target.value })
  }

  // A foto é salva na hora em que é escolhida (POST /usuarios/me/foto).
  async function trocarFoto(evento) {
    const arquivo = evento.target.files[0]
    evento.target.value = ''
    if (!arquivo) return
    const problema = conferirImagem(arquivo)
    if (problema) {
      setErroFoto(problema)
      return
    }
    setErroFoto(null)
    setEnviandoFoto(true)
    try {
      const atualizado = await api.atualizarFotoPerfil(arquivo)
      setDados({ ...dados, fotoPerfil: atualizado.fotoPerfil })
      atualizarUsuario(atualizado)
    } catch (falha) {
      setErroFoto(falha.campos?.arquivo || falha.message)
    } finally {
      setEnviandoFoto(false)
    }
  }

  // Tira a foto (DELETE /usuarios/me/foto): o perfil volta a mostrar as iniciais.
  async function removerFoto() {
    setErroFoto(null)
    setEnviandoFoto(true)
    try {
      const atualizado = await api.removerFotoPerfil()
      setDados({ ...dados, fotoPerfil: null })
      atualizarUsuario(atualizado)
    } catch (falha) {
      setErroFoto(falha.message)
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function aoSalvar(evento) {
    evento.preventDefault()
    const errosNaTela = validarDadosPessoais(dados)
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const atualizado = await api.atualizarMeusDados({
        nome: dados.nome, username: dados.username, bio: dados.bio, telefone: dados.telefone,
        capaCor: dados.capaCor, capaFrase: dados.capaFrase,
      })
      atualizarUsuario(atualizado)
      navegar(`/perfil/${atualizado.username}`)
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  const campos = erro?.campos || {}

  return (
    <>
      <BarraNavegacao />
      <main className="fb-pagina-media">
        <h1 className="mb-2">Editar perfil</h1>
        <p className="fb-subtitulo mb-5">Essas informações aparecem no seu perfil público, exceto telefone e e-mail.</p>

        {!dados ? (
          erro ? <Aviso>{erro.message}</Aviso> : <p className="fb-vazio">Carregando…</p>
        ) : (
          <form onSubmit={aoSalvar} noValidate className="d-flex flex-column gap-4">
            <section className="fb-caixa d-flex flex-wrap align-items-center gap-4">
              <Avatar nome={dados.nome} foto={dados.fotoPerfil} tamanho="medio" />
              <div className="flex-grow-1">
                <strong className="fb-autor">Foto de perfil</strong>
                <div className="fb-cartao-meta mt-0">JPG ou PNG, até 5 MB.</div>
                {erroFoto && <div className="fb-erro-campo ms-0">{erroFoto}</div>}
              </div>
              <input ref={seletorDeFoto} type="file" accept="image/jpeg,image/png" hidden onChange={trocarFoto} />
              <div className="d-flex flex-wrap gap-2">
                {dados.fotoPerfil && (
                  <button type="button" className="fb-botao fb-botao-texto fb-link-discreto px-2" disabled={enviandoFoto}
                    onClick={removerFoto}>
                    Usar as iniciais
                  </button>
                )}
                <button type="button" className="fb-botao fb-botao-claro" disabled={enviandoFoto}
                  onClick={() => seletorDeFoto.current.click()}>
                  {enviandoFoto ? 'Enviando…' : 'Trocar foto'}
                </button>
              </div>
            </section>

            <section className="fb-caixa">
              <h2 className="mb-1" style={{ fontSize: '1.65rem' }}>Capa do perfil</h2>
              <p className="fb-cartao-meta mb-4">Escolha a cor e a frase. A prévia mostra como vai ficar.</p>

              <CapaPerfil cor={dados.capaCor} frase={dados.capaFrase} pequena />

              <div className="fb-rotulo mt-4">Cor</div>
              <div className="fb-cores-capa" role="radiogroup" aria-label="Cor da capa">
                {CORES_DE_CAPA.map((c) => (
                  <button key={c.codigo} type="button" role="radio" aria-checked={dados.capaCor === c.codigo}
                    aria-label={c.nome} title={c.nome} className={`fb-cor-capa ${dados.capaCor === c.codigo ? 'ativo' : ''}`}
                    style={{ background: c.fundo, color: c.texto }} onClick={() => setDados({ ...dados, capaCor: c.codigo })}>
                    {dados.capaCor === c.codigo && <i className="bi bi-check-lg" aria-hidden="true"></i>}
                  </button>
                ))}
              </div>
              {campos.capaCor && <div className="fb-erro-campo">{campos.capaCor}</div>}

              <div className="fb-rotulo mt-4">Frase</div>
              <div className="d-flex flex-wrap gap-2" role="radiogroup" aria-label="Frase da capa">
                {FRASES_DE_CAPA.map((f) => (
                  <button key={f.codigo} type="button" role="radio" aria-checked={dados.capaFrase === f.codigo}
                    className={`fb-chip ${dados.capaFrase === f.codigo ? 'ativo' : ''}`}
                    onClick={() => setDados({ ...dados, capaFrase: f.codigo })}>
                    {f.texto}
                  </button>
                ))}
              </div>
              {campos.capaFrase && <div className="fb-erro-campo">{campos.capaFrase}</div>}
            </section>

            <Aviso>{erro?.message}</Aviso>

            <section className="fb-caixa">
              <h2 className="mb-4" style={{ fontSize: '1.65rem' }}>Dados pessoais</h2>
              <Campo rotulo="Nome completo" name="nome" autoComplete="name" value={dados.nome}
                onChange={aoDigitar} erro={campos.nome} required />
              <Campo rotulo="Nome de usuário" name="username" icone="bi-at" autoComplete="username"
                value={dados.username} onChange={aoDigitar} erro={campos.username}
                ajuda="Apenas letras, números, ponto (.) e sublinhado (_)." required />

              <div className="mb-4">
                <label htmlFor="bio" className="fb-rotulo">Bio</label>
                <textarea id="bio" name="bio" className="fb-area-texto" rows="3" value={dados.bio} onChange={aoDigitar}></textarea>
                {campos.bio && <div className="fb-erro-campo">{campos.bio}</div>}
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <Campo rotulo="Telefone" name="telefone" type="tel" placeholder="(13) 99999-0000" autoComplete="tel"
                    value={dados.telefone} onChange={aoDigitar} erro={campos.telefone} required />
                </div>
                <div className="col-sm-6">
                  <div className="mb-4">
                    <label htmlFor="email" className="fb-rotulo">E-mail</label>
                    <div className="fb-campo fb-campo-travado">
                      <input id="email" value={dados.email} disabled />
                      <i className="bi bi-lock" aria-hidden="true"></i>
                    </div>
                    <div className="fb-ajuda">O e-mail não pode ser alterado.</div>
                  </div>
                </div>
              </div>
            </section>

            <div className="d-flex justify-content-end gap-3">
              <Link to="/perfil" className="fb-botao fb-botao-claro">Cancelar</Link>
              <button type="submit" className="fb-botao fb-botao-principal" disabled={enviando}>
                {enviando ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </main>
      <Rodape />
    </>
  )
}


