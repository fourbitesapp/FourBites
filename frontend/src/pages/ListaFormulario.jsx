import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import BarraNavegacao from '../components/BarraNavegacao.jsx'
import Rodape from '../components/Rodape.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { CORES_DE_LISTA, ICONES_DE_LISTA, LISTA_VAZIA, textoQuantidade } from '../utils/listas.js'
import { temRecursosDeUsuario } from '../utils/papeis.js'

// Criar (modo "nova") ou editar (modo "editar") uma lista: nome, descrição, cor, ícone e se é pública.
// Ao lado, uma prévia de como o cartão vai aparecer no perfil.
export default function ListaFormulario({ modo }) {
  const { id } = useParams()
  const { usuario, logado } = useAuth()
  const navegar = useNavigate()
  const editando = modo === 'editar'

  const [form, setForm] = useState(editando ? null : LISTA_VAZIA)
  const [total, setTotal] = useState(0)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!editando) return
    api.buscarLista(id)
      .then((lista) => {
        if (!lista.minha) {
          setErro({ message: 'Só quem criou a lista pode editar.' })
          return
        }
        setForm({
          nome: lista.nome, descricao: lista.descricao || '', cor: lista.cor || LISTA_VAZIA.cor,
          icone: lista.icone || LISTA_VAZIA.icone, publica: lista.publica,
        })
        setTotal(lista.totalRestaurantes)
      })
      .catch(setErro)
  }, [editando, id])

  if (!logado || !temRecursosDeUsuario(usuario)) {
    return <Navigate to="/login" replace state={{ voltarPara: editando ? `/listas/${id}/editar` : '/listas/nova' }} />
  }

  function mudar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (!form.nome.trim()) {
      setErro({ message: 'Dê um nome para a lista.', campos: { nome: 'Dê um nome para a lista.' } })
      return
    }
    setEnviando(true)
    setErro(null)
    const dados = { ...form, nome: form.nome.trim(), descricao: form.descricao.trim() || null }
    try {
      const salva = editando ? await api.editarLista(id, dados) : await api.criarLista(dados)
      navegar(`/listas/${salva.id}`, { replace: true })
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  const campos = erro?.campos || {}

  return (
    <>
      <BarraNavegacao />
      <main className="fb-conteudo">
        <div className="mb-5">
          <span className="fb-mao">do seu jeito</span>
          <h1 className="mt-1">{editando ? 'Editar lista' : 'Nova lista'}</h1>
          <p className="fb-subtitulo mb-0" style={{ maxWidth: '40em' }}>
            Junte restaurantes para cada ocasião: um date, um almoço em família, o aniversário de alguém.
          </p>
        </div>

        <Aviso>{erro?.message}</Aviso>

        {!form && !erro && <p className="fb-vazio">Carregando…</p>}

        {form && (
          <form onSubmit={salvar} className="fb-lista-edicao">
            <div className="d-flex flex-column gap-4" style={{ flex: '999 1 520px', minWidth: 0 }}>
              <section className="fb-caixa">
                <label htmlFor="lista-nome" className="fb-rotulo">Nome da lista</label>
                <span className={`fb-campo ${campos.nome ? 'fb-campo-erro' : ''}`}>
                  <input id="lista-nome" maxLength={60} placeholder="Ex.: Pra date" value={form.nome}
                    onChange={(e) => mudar('nome', e.target.value)} />
                </span>
                {campos.nome && <div className="fb-erro-campo">{campos.nome}</div>}

                <label htmlFor="lista-descricao" className="fb-rotulo mt-4">
                  Descrição <span className="fb-apagado fw-normal">(opcional)</span>
                </label>
                <textarea id="lista-descricao" className="fb-area-texto" rows="3" maxLength={200}
                  placeholder="Ex.: lugares com luz baixinha e sobremesa caprichada"
                  value={form.descricao} onChange={(e) => mudar('descricao', e.target.value)}></textarea>
                <div className="fb-ajuda text-end">{form.descricao.length}/200</div>
              </section>

              <section className="fb-caixa">
                <fieldset>
                  <legend className="fb-rotulo">Ícone</legend>
                  <div className="fb-escolha-icones">
                    {ICONES_DE_LISTA.map((opcao) => (
                      <button key={opcao.icone} type="button" title={opcao.rotulo} aria-label={opcao.rotulo}
                        aria-pressed={form.icone === opcao.icone}
                        className={`fb-escolha-icone fb-escolha-icone-lista ${form.icone === opcao.icone ? 'marcada' : ''}`}
                        onClick={() => mudar('icone', opcao.icone)}>
                        <i className={`bi ${opcao.icone}`} aria-hidden="true"></i>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mt-4">
                  <legend className="fb-rotulo">Cor</legend>
                  <div className="fb-escolha-cores">
                    {CORES_DE_LISTA.map((cor) => (
                      <button key={cor} type="button" aria-label={`Cor ${cor}`} aria-pressed={form.cor === cor}
                        className={`fb-escolha-cor ${form.cor === cor ? 'marcada' : ''}`} style={{ background: cor }}
                        onClick={() => mudar('cor', cor)}></button>
                    ))}
                  </div>
                </fieldset>
              </section>

              <section className="fb-caixa">
                <fieldset>
                  <legend className="fb-rotulo">Quem pode ver</legend>
                  <div className="fb-extras" role="radiogroup" aria-label="Quem pode ver">
                    <button type="button" role="radio" aria-checked={form.publica}
                      className={`fb-extra ${form.publica ? 'ativo' : ''}`} onClick={() => mudar('publica', true)}>
                      <span className="fb-extra-icone" style={{ background: '#b5dcf8' }}>
                        <i className="bi bi-globe2" aria-hidden="true"></i>
                      </span>
                      <span className="flex-grow-1">
                        <strong className="d-block">Pública</strong>
                        <small className="fb-apagado">Aparece no seu perfil para todo mundo</small>
                      </span>
                    </button>
                    <button type="button" role="radio" aria-checked={!form.publica}
                      className={`fb-extra ${!form.publica ? 'ativo' : ''}`} onClick={() => mudar('publica', false)}>
                      <span className="fb-extra-icone" style={{ background: '#e6ddd3' }}>
                        <i className="bi bi-lock" aria-hidden="true"></i>
                      </span>
                      <span className="flex-grow-1">
                        <strong className="d-block">Privada</strong>
                        <small className="fb-apagado">Só você vê</small>
                      </span>
                    </button>
                  </div>
                </fieldset>
              </section>

              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <Link to={editando ? `/listas/${id}` : '/perfil'} className="fb-botao fb-botao-claro">Cancelar</Link>
                <button type="submit" className="fb-botao fb-botao-principal" disabled={enviando}>
                  {enviando ? 'Salvando…' : editando ? 'Salvar lista' : 'Criar lista'}
                </button>
              </div>
            </div>

            {/* Prévia ao vivo */}
            <aside className="fb-lista-previa" aria-label="Prévia da lista">
              <span className="fb-rotulo">Prévia</span>
              <div className="fb-lista-banner" style={{ background: form.cor }}>
                <span className="fb-lista-banner-icone"><i className={`bi ${form.icone}`} aria-hidden="true"></i></span>
                <div style={{ minWidth: 0 }}>
                  <strong className="d-block fb-lista-banner-nome">{form.nome.trim() || 'Nome da lista'}</strong>
                  <span className="d-flex align-items-center gap-2 small fw-bold">
                    <i className={`bi ${form.publica ? 'bi-globe2' : 'bi-lock-fill'}`} aria-hidden="true"></i>
                    {form.publica ? 'Pública' : 'Privada'} · {textoQuantidade(total)}
                  </span>
                </div>
              </div>
              {form.descricao.trim() && <p className="fb-cartao-meta mt-3 mb-0">{form.descricao}</p>}
              {!editando && (
                <p className="fb-ajuda mt-3 mb-0 ms-0">Depois de criar, é só buscar e adicionar os restaurantes.</p>
              )}
            </aside>
          </form>
        )}
      </main>
      <Rodape />
    </>
  )
}