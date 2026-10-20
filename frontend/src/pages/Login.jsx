import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import * as api from '../services/apiReal.js'
import { erroDeValidacao, temErros, validarEmail } from '../utils/validacoes.js'

// Tela de entrar
export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function temPreferencias() {
    try {
      await api.buscarPreferencias()
      return true
    } catch (falha) {
      if (falha.status === 404) {
        return false
      }
      return true
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = { ...validarEmail(email), ...(senha ? {} : { senha: 'A senha é obrigatória.' }) }
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      const usuario = await entrar(email, senha)
      // Sem página para voltar: restaurante vai para "Meus restaurantes" e admin para o painel.
      const areaDaConta = { RESTAURANTE: '/meus-restaurantes', ADMIN: '/admin' }[usuario.papel] || '/'
      const destino = local.state?.voltarPara || areaDaConta

      // Primeiro acesso: conta USUARIO que ainda não tem preferências vai para a tela de preferências.
      if (usuario.papel === 'USUARIO' && !(await temPreferencias())) {
        navegar('/preferencias', { replace: true, state: { voltarPara: destino } })
      } else {
        navegar(destino, { replace: true })
      }
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TelaAcesso frase="bem-vindo de volta!" titulo="Seu próximo lugar favorito tá aqui.">
      <div className="fb-abas">
        <span className="fb-aba ativa" aria-current="page">Entrar</span>
        <Link to="/cadastro" className="fb-aba">Criar conta</Link>
      </div>

      <div>
        <h1 className="mb-2">Entrar</h1>
        <p className="fb-subtitulo mb-0">O mesmo acesso vale para clientes e restaurantes.</p>
      </div>

      <form onSubmit={aoEnviar} noValidate className="mt-2">
        {!erro && <Aviso tipo="info">{local.state?.aviso}</Aviso>}
        <Aviso>{erro?.message}</Aviso>

        <Campo
          rotulo="E-mail" name="email" type="email" icone="bi-envelope" placeholder="seu@email.com"
          autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          erro={erro?.campos.email} required
        />

        <div className="mb-2">
          <label htmlFor="senha" className="fb-rotulo">Senha</label>
          <div className={`fb-campo ${erro?.campos.senha ? 'fb-campo-erro' : ''}`}>
            <i className="bi bi-lock" aria-hidden="true"></i>
            <input
              id="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Sua senha"
              autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required
            />
            <button
              type="button" className="fb-campo-acao" onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <i className={mostrarSenha ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true"></i>
            </button>
          </div>
          {erro?.campos.senha && <div className="fb-erro-campo">{erro.campos.senha}</div>}
        </div>
        <div className="text-end">
          <Link to="/esqueci-senha" className="fb-sublinhado-leve small">Esqueci minha senha</Link>
        </div>

        <button type="submit" className="fb-botao fb-botao-principal w-100 mt-4" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="fb-divisor my-2">ou</div>

      <Link to="/explorar" className="fb-botao fb-botao-suave w-100">Continuar sem entrar e só explorar</Link>
    </TelaAcesso>
  )
}
