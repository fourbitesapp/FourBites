import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import * as api from '../services/apiReal.js'
import { erroDeValidacao, temErros, validarSenhaNova } from '../utils/validacoes.js'

// Tela aberta pelo link do e-mail: /redefinir-senha?token=...
export default function RedefinirSenha() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')
  const navegar = useNavigate()

  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = validarSenhaNova(senha, confirmacaoSenha)
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      await api.redefinirSenha({ token, senha, confirmacaoSenha })
      navegar('/login', { replace: true, state: { aviso: 'Senha alterada. Entre com a senha nova.' } })
    } catch (falha) {
      setErro(falha)
      setEnviando(false)
    }
  }

  return (
    <TelaAcesso frase="quase lá!" titulo="Escolha uma senha nova e volte a comer bem.">
      <Link to="/login" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar para o login</Link>

      <div>
        <h1 className="mb-2">Criar senha nova</h1>
        <p className="fb-subtitulo mb-0">Escolha uma senha com pelo menos 8 caracteres.</p>
      </div>

      {!token ? (
        <div>
          <Aviso>Este link está incompleto. Peça um link novo.</Aviso>
          <Link to="/esqueci-senha" className="fb-botao fb-botao-principal w-100">Pedir link novo</Link>
        </div>
      ) : (
        <form onSubmit={aoEnviar} noValidate className="mt-2">
          <Aviso>{erro?.message}</Aviso>
          <Campo rotulo="Senha nova" name="senha" type="password" icone="bi-lock" autoComplete="new-password"
            value={senha} onChange={(e) => setSenha(e.target.value)} erro={erro?.campos.senha}
            ajuda="No mínimo 8 caracteres." required />
          <Campo rotulo="Confirmar senha nova" name="confirmacaoSenha" type="password" icone="bi-lock"
            autoComplete="new-password" value={confirmacaoSenha} onChange={(e) => setConfirmacaoSenha(e.target.value)}
            erro={erro?.campos.confirmacaoSenha} required />
          <button type="submit" className="fb-botao fb-botao-principal w-100" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar senha nova'}
          </button>
          {erro && !erro.campos?.senha && !erro.campos?.confirmacaoSenha && (
            <p className="text-center mt-3 mb-0">
              <Link to="/esqueci-senha" className="fb-sublinhado-leve">Pedir link novo</Link>
            </p>
          )}
        </form>
      )}
    </TelaAcesso>
  )
}
