import { useEffect, useState } from 'react'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import IconeCozinha from '../../components/IconeCozinha.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import * as api from '../../services/apiReal.js'
import { corDaCozinha } from '../../utils/cozinhas.js'

// Aba "Categorias": lista com quantos restaurantes cada uma tem e a opção de renomear.
// Categorias novas não são criadas aqui: nascem ao aprovar um cadastro com "outra categoria".
export default function AdminCategorias() {
  return (
    <AreaRestrita papel="ADMIN">
      <ListaDeCategorias />
    </AreaRestrita>
  )
}

function ListaDeCategorias() {
  const [categorias, setCategorias] = useState(null)
  const [erro, setErro] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [erroNome, setErroNome] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api.adminListarCategorias().then(setCategorias).catch(setErro)
  }, [])

  function comecarAEditar(categoria) {
    setEditandoId(categoria.id)
    setNovoNome(categoria.nome)
    setErroNome(null)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (!novoNome.trim()) {
      setErroNome('Escreva o nome da categoria.')
      return
    }
    setSalvando(true)
    setErroNome(null)
    try {
      const atualizada = await api.adminRenomearCategoria(editandoId, novoNome.trim())
      setCategorias((lista) => lista.map((c) => (c.id === atualizada.id ? atualizada : c)))
      setEditandoId(null)
    } catch (falha) {
      setErroNome(falha.campos?.nome || falha.message) // 409 quando o nome já existe
    } finally {
      setSalvando(false)
    }
  }

  return (
    <PainelAdmin>
      <Aviso>{erro?.message}</Aviso>
      <div className="fb-analise">
        <section className="fb-caixa" style={{ flex: '999 1 560px', minWidth: 0, padding: '0.75rem 1.75rem' }}>
          {!categorias && !erro && <p className="fb-vazio">Carregando…</p>}
          <ul className="fb-lista-categorias">
            {categorias?.map((c) => (
              <li key={c.id}>
                <span className="fb-mini fb-mini-pequeno" style={{ background: corDaCozinha(c.id) }} aria-hidden="true">
                  <IconeCozinha nome={c.nome} tamanho={26} />
                </span>
                {editandoId === c.id ? (
                  <form onSubmit={salvar} className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
                    <label htmlFor="renomear" className="visually-hidden">Novo nome da categoria</label>
                    <span className={`fb-campo flex-grow-1 py-2 ${erroNome ? 'fb-campo-erro' : ''}`} style={{ flexBasis: '240px' }}>
                      <input id="renomear" value={novoNome} autoFocus onChange={(e) => setNovoNome(e.target.value)} />
                    </span>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => setEditandoId(null)}>Cancelar</button>
                    <button type="submit" className="fb-botao fb-botao-principal fb-botao-pequeno" disabled={salvando}>
                      {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                    {erroNome && <div className="fb-erro-campo w-100">{erroNome}</div>}
                  </form>
                ) : (
                  <>
                    <strong className="flex-grow-1 fs-6" style={{ color: 'var(--fb-tinta)' }}>{c.nome}</strong>
                    <span className="fb-apagado" style={{ minWidth: '8rem', fontSize: '0.95rem' }}>
                      {c.totalRestaurantes === 0 ? 'nenhum restaurante'
                        : `${c.totalRestaurantes} ${c.totalRestaurantes === 1 ? 'restaurante' : 'restaurantes'}`}
                    </span>
                    <button type="button" className="fb-botao fb-botao-claro fb-botao-pequeno"
                      onClick={() => comecarAEditar(c)}>Renomear</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <aside className="fb-explicacao">
          <h2>Como surgem categorias novas</h2>
          <p>
            Quando um restaurante sugere uma categoria que não existe, ela é criada na hora de aprovar o cadastro
            (aba Cadastros).
          </p>
          <p>Aqui dá para corrigir o nome. Renomear muda em todos os restaurantes que usam essa categoria.</p>
        </aside>
      </div>
    </PainelAdmin>
  )
}
