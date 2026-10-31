import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import AreaRestrita from '../../components/AreaRestrita.jsx'
import Aviso from '../../components/Aviso.jsx'
import JanelaMotivo from '../../components/JanelaMotivo.jsx'
import MiniRestaurante from '../../components/MiniRestaurante.jsx'
import PainelAdmin from '../../components/PainelAdmin.jsx'
import Seletor from '../../components/Seletor.jsx'
import * as api from '../../services/apiReal.js'
import { agruparHorarios, formatarData, haQuantoTempo } from '../../utils/formatos.js'
import { CARACTERISTICAS, formatarCnpj, formatarMesAno, nomeDaCategoria, textoEndereco } from '../../utils/restaurantes.js'
import { foto } from '../../utils/imagens.js'

// Aba "Cadastros": fila de restaurantes novos esperando análise (do mais antigo ao mais novo).
// O admin aprova (e publica) ou pede ajustes com um motivo. "?id=" escolhe qual cadastro abrir.
export default function AdminCadastros() {
  return (
    <AreaRestrita papel="ADMIN">
      <FilaDeCadastros />
    </AreaRestrita>
  )
}

function FilaDeCadastros() {
  const [parametros, setParametros] = useSearchParams()
  const [fila, setFila] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [versao, setVersao] = useState(0) // atualiza os contadores das abas

  useEffect(() => {
    Promise.all([api.adminListarRestaurantes({ status: 'PENDENTE' }), api.listarCategorias()])
      .then(([pendentes, lista]) => {
        setFila(pendentes)
        setCategorias(lista)
      })
      .catch(setErro)
  }, [])

  const idEscolhido = Number(parametros.get('id'))
  const escolhido = fila?.find((r) => r.id === idEscolhido) || fila?.[0]

  // Depois de aprovar ou pedir ajustes, o cadastro sai da fila e abre o próximo.
  function tirarDaFila(restaurante, mensagem) {
    setFila((atual) => atual.filter((r) => r.id !== restaurante.id))
    setParametros({}, { replace: true })
    setAviso(mensagem)
    setVersao((v) => v + 1)
  }

  return (
    <PainelAdmin versao={versao}>
      <div className="mt-4">
        <Aviso tipo="info">{aviso}</Aviso>
        <Aviso>{erro?.message}</Aviso>
      </div>

      {!fila && !erro && <p className="fb-vazio">Carregando…</p>}
      {fila?.length === 0 && <p className="fb-vazio">Nenhum cadastro esperando análise. Tudo em dia!</p>}

      {escolhido && (
        <div className="fb-analise">
          <aside className="fb-analise-fila">
            <p className="fb-autor mb-1">
              {fila.length} {fila.length === 1 ? 'cadastro esperando' : 'cadastros esperando'} · mais antigos primeiro
            </p>
            {fila.map((r) => (
              <button key={r.id} type="button" className={`fb-fila ${r.id === escolhido.id ? 'ativa' : ''}`}
                aria-current={r.id === escolhido.id} onClick={() => setParametros({ id: r.id })}>
                <MiniRestaurante restaurante={r} />
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <strong>{r.nome}</strong>
                  <span className="fb-fila-meta">
                    {r.categoria ? r.categoria.nome : `Categoria sugerida: ${r.categoriaSugerida}`} · {r.bairro}
                  </span>
                  <small>enviado {haQuantoTempo(r.dataEnvio)}</small>
                </span>
              </button>
            ))}
          </aside>

          {/* key: trocar de cadastro recomeça as escolhas de categoria */}
          <DetalheDoCadastro key={escolhido.id} restaurante={escolhido} categorias={categorias} aoTerminar={tirarDaFila} />
        </div>
      )}
    </PainelAdmin>
  )
}

function DetalheDoCadastro({ restaurante: r, categorias, aoTerminar }) {
  // Categoria sugerida pelo responsável ("outra categoria"): o admin cria ou troca por uma que já existe.
  const precisaResolverCategoria = !r.categoria && Boolean(r.categoriaSugerida)
  const [escolhaCategoria, setEscolhaCategoria] = useState('nova') // 'nova' ou 'existente'
  const [categoriaExistente, setCategoriaExistente] = useState('')
  const [erro, setErro] = useState(null)
  const [aprovando, setAprovando] = useState(false)
  const [pedindoAjustes, setPedindoAjustes] = useState(false)

  async function aprovar() {
    let escolha = {}
    if (precisaResolverCategoria) {
      if (escolhaCategoria === 'existente' && !categoriaExistente) {
        setErro({ message: 'Escolha a categoria que vai ser usada.' })
        return
      }
      escolha = escolhaCategoria === 'nova'
        ? { novaCategoria: r.categoriaSugerida }
        : { categoriaId: Number(categoriaExistente) }
    }
    setErro(null)
    setAprovando(true)
    try {
      await api.adminAprovarCadastro(r.id, escolha)
      aoTerminar(r, `${r.nome} foi aprovado e já aparece no site.`)
    } catch (falha) {
      setErro(falha)
      setAprovando(false)
    }
  }

  async function pedirAjustes(motivo) {
    await api.adminRejeitarCadastro(r.id, motivo)
    setPedindoAjustes(false)
    aoTerminar(r, `Pedido de ajustes enviado para ${r.responsavel?.nome || 'o responsável'}.`)
  }

  const opcoesCategoria = [
    { valor: '', rotulo: 'Escolher categoria' },
    ...categorias.map((c) => ({ valor: c.id, rotulo: c.nome })),
  ]
  const comodidades = CARACTERISTICAS.filter((c) => r[c.campo]).map((c) => c.rotulo).join(', ') || 'Nenhuma'

  return (
    <section className="fb-caixa fb-analise-detalhe">
      <div className="d-flex flex-wrap gap-4 align-items-start">
        {r.fotoCapa
          ? <img src={foto(r.fotoCapa, 480)} alt="" style={{ width: 220, height: 150, objectFit: 'cover', borderRadius: 22 }} />
          : <MiniRestaurante restaurante={r} />}
        <div className="d-flex flex-column gap-2" style={{ flex: '1 1 260px' }}>
          <span className="fb-selo fb-selo-amarelo align-self-start">
            <span className="fb-ponto" aria-hidden="true"></span>Cadastro novo · enviado em {formatarData(r.dataEnvio)}
          </span>
          <h2 className="m-0">{r.nome}</h2>
          <span className="fb-apagado">{r.faixaPreco} · {textoEndereco(r.endereco)}</span>
          {r.responsavel && (
            <span style={{ color: 'var(--fb-tinta)' }}>
              Responsável: <strong>{r.responsavel.nome}</strong> · {r.responsavel.email} · {r.responsavel.telefone}
            </span>
          )}
        </div>
      </div>

      {precisaResolverCategoria && (
        <div className="fb-escolha-categoria">
          <div>
            <strong className="fs-5">O responsável sugeriu uma categoria nova: “{r.categoriaSugerida}”</strong>
            <p className="mb-0 mt-1">Escolha o que fazer antes de aprovar.</p>
          </div>
          <div role="radiogroup" aria-label="Categoria" className="d-flex flex-column gap-2">
            <label className={`fb-opcao-radio ${escolhaCategoria === 'nova' ? 'ativo' : ''}`}>
              <input type="radio" name="categoria" checked={escolhaCategoria === 'nova'}
                onChange={() => setEscolhaCategoria('nova')} />
              Criar a categoria “{r.categoriaSugerida}”
            </label>
            <div className={`fb-opcao-radio ${escolhaCategoria === 'existente' ? 'ativo' : ''}`}>
              <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="radio" name="categoria" checked={escolhaCategoria === 'existente'}
                  onChange={() => setEscolhaCategoria('existente')} />
                Usar uma que já existe:
              </label>
              <span className="ms-auto">
                <Seletor rotulo="Categoria existente" valor={categoriaExistente} opcoes={opcoesCategoria}
                  aoMudar={(valor) => {
                    setCategoriaExistente(valor)
                    setEscolhaCategoria('existente')
                  }} />
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="fb-dados">
        <div>
          <span className="fb-rotulo-dado">CNPJ</span>
          {r.cnpj ? <>{formatarCnpj(r.cnpj)} <span className="fb-selo fb-selo-verde py-0 ms-1">válido</span></> : '—'}
        </div>
        <div><span className="fb-rotulo-dado">Categoria</span>{nomeDaCategoria(r)}</div>
        <div><span className="fb-rotulo-dado">Abriu em</span>{formatarMesAno(r.dataFundacao)}</div>
        <div><span className="fb-rotulo-dado">Telefone</span>{r.telefone}</div>
        <div>
          <span className="fb-rotulo-dado">Pagamento</span>
          {r.formasPagamento.map((f) => f.nome).join(', ') || 'Nenhuma'}
        </div>
        <div><span className="fb-rotulo-dado">Comodidades</span>{comodidades}</div>
        <div>
          <span className="fb-rotulo-dado">Cardápio</span>
          {!r.cardapioUrl && !r.cardapioLink && '—'}
          {r.cardapioUrl && <a href={r.cardapioUrl} target="_blank" rel="noreferrer" className="fb-link">Arquivo</a>}
          {r.cardapioUrl && r.cardapioLink && ' · '}
          {r.cardapioLink && <a href={r.cardapioLink} target="_blank" rel="noreferrer" className="fb-link">Link</a>}
        </div>
        <div className="inteiro"><span className="fb-rotulo-dado">Descrição</span>{r.descricao}</div>
        <div className="inteiro">
          <span className="fb-rotulo-dado">Horários</span>
          <table className="fb-horarios" style={{ width: 'auto' }}>
            <tbody>
              {agruparHorarios(r.horarios).map((linha) => (
                <tr key={linha.dia}>
                  <th scope="row">{linha.dia}</th>
                  <td className="text-start">{linha.periodos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inteiro">
          <span className="fb-rotulo-dado">Fotos ({r.fotos.length})</span>
          <div className="d-flex flex-wrap gap-2">
            {r.fotos.length === 0 && 'Nenhuma foto'}
            {r.fotos.map((url) => <img key={url} src={foto(url, 300)} alt="" className="fb-foto-pequena" />)}
          </div>
        </div>
      </div>

      <Aviso>{erro?.message}</Aviso>
      <div className="fb-acoes-analise">
        <button type="button" className="fb-botao fb-botao-contorno" onClick={() => setPedindoAjustes(true)}>
          Pedir ajustes
        </button>
        <button type="button" className="fb-botao fb-botao-principal" onClick={aprovar} disabled={aprovando}>
          {aprovando ? 'Aprovando…' : 'Aprovar e publicar'}
        </button>
      </div>

      {pedindoAjustes && (
        <JanelaMotivo titulo={`Pedir ajustes em ${r.nome}`}
          explicacao="O responsável vai ver esta mensagem em “Meus restaurantes”, corrigir e reenviar."
          botao="Enviar pedido de ajustes" aoConfirmar={pedirAjustes} aoFechar={() => setPedindoAjustes(false)} />
      )}
    </section>
  )
}
