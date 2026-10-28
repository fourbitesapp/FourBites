import { useState } from 'react'
import { Link } from 'react-router-dom'

import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import TelaAcesso from '../components/TelaAcesso.jsx'
import * as api from '../services/apiReal.js'
import { erroDeValidacao, temErros, validarEmail } from '../utils/validacoes.js'

// Pede o e-mail e manda o link de redefinição. A resposta é sempre a mesma,
// exista ou não uma conta com esse e-mail (assim ninguém descobre quem tem conta).
export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    const errosNaTela = validarEmail(email)
    if (temErros(errosNaTela)) {
      setErro(erroDeValidacao(errosNaTela))
      return
    }
    setErro(null)
    setEnviando(true)
    try {
      await api.esqueciSenha(email.trim())
      setEnviado(true)
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <TelaAcesso frase="acontece com todo mundo!" titulo="Vamos criar uma senha nova pra você.">
      <Link to="/login" className="fb-link-discreto"><i className="bi bi-arrow-left" aria-hidden="true"></i> Voltar para o login</Link>

      {enviado ? (
        <div>
          <h1 className="mb-3">Confira seu e-mail</h1>
          <p className="fb-subtitulo">
            Se existir uma conta com <strong>{email.trim()}</strong>, você vai receber o link em alguns minutos.
          </p>
          <p className="fb-cartao-meta">O link vale por 30 minutos e só pode ser usado uma vez. Olhe também a caixa de spam.</p>
          <Link to="/login" className="fb-botao fb-botao-principal w-100 mt-3">Voltar para o login</Link>
        </div>
      ) : (
        <>
          <div>
            <h1 className="mb-2">Esqueci minha senha</h1>
            <p className="fb-subtitulo mb-0">Informe o e-mail da sua conta e enviaremos um link para criar uma senha nova.</p>
          </div>
          <form onSubmit={aoEnviar} noValidate className="mt-2">
            <Aviso>{erro?.message}</Aviso>
            <Campo rotulo="E-mail" name="email" type="email" icone="bi-envelope" placeholder="seu@email.com"
              autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              erro={erro?.campos.email} required />
            <button type="submit" className="fb-botao fb-botao-principal w-100" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar link'}
            </button>
          </form>
        </>
      )}
    </TelaAcesso>
  )
}
