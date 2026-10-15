import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email, senha)
      navegar(local.state?.voltarPara || '/explorar', { replace: true })
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fb-acesso">
      <aside className="fb-acesso-vitrine">
        <Link to="/explorar" className="fb-marca fb-marca-grande">
          <span className="fb-logo"><i className="bi bi-fork-knife" aria-hidden="true"></i></span>
          fourbites
        </Link>
        <h2>Descubra restaurantes pela opinião de quem foi de verdade.</h2>
        <ul className="fb-vantagens">
          <li><i className="bi bi-star-fill" aria-hidden="true"></i> Notas separadas para comida, ambiente, atendimento e custo-benefício</li>
          <li><i className="bi bi-check-lg" aria-hidden="true"></i> Avaliações orgânicas, sem conteúdo patrocinado</li>
          <li><i className="bi bi-heart" aria-hidden="true"></i> Recomendações que combinam com o seu gosto</li>
        </ul>
      </aside>

      <main className="fb-acesso-formulario">
        <div className="fb-acesso-caixa">
          <h1>Bem-vindo ao FourBites</h1>
          <p className="fb-subtitulo">Entre com seu e-mail e senha. O mesmo acesso vale para clientes e restaurantes.</p>

          <form onSubmit={aoEnviar} noValidate>
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
                  id="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Senha"
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

            <button type="submit" className="fb-botao fb-botao-principal w-100 mt-3" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="fb-divisor"><span>Ainda não tem conta?</span></div>

          <Link to="/cadastro" className="fb-cartao fb-cartao-opcao">
            <span className="fb-icone-suave"><i className="bi bi-person" aria-hidden="true"></i></span>
            <span>
              <strong>Sou cliente</strong>
              <small>Avalie restaurantes, salve favoritos e receba recomendações.</small>
              <span className="fb-link">Criar conta <i className="bi bi-arrow-right" aria-hidden="true"></i></span>
            </span>
          </Link>

          <p className="text-center mt-4 mb-0">
            <Link to="/explorar" className="fb-link-discreto">Continuar sem entrar e só explorar</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
