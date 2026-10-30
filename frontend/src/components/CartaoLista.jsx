import { Link } from 'react-router-dom'

import { corDaLista, iconeDaLista, textoQuantidade } from '../utils/listas.js'
import SeloOficial from './SeloOficial.jsx'

// Cartão de uma lista: mosaico com as fotos de até 4 restaurantes (ou o ícone na cor da lista), nome, quantos restaurantes e um cadeado quando é privada
// mostrarDono: escreve "de Fulano" (usado em "Listas que sigo", onde as listas são de outras pessoas)
export default function CartaoLista({ lista, mostrarDono = false }) {
  const cor = corDaLista(lista)
  return (
    <Link to={`/listas/${lista.id}`} className="fb-cartao-lista">
      <div className={`fb-lista-capa ${lista.capas.length >= 4 ? 'mosaico' : ''}`} style={{ background: cor }}>
        {lista.capas.length >= 4
          ? lista.capas.map((url) => <img key={url} src={url} alt="" />)
          : lista.capas.length > 0
            ? <img src={lista.capas[0]} alt="" />
            : null}
        <span className="fb-lista-selo-icone" style={{ background: cor }}>
          <i className={`bi ${iconeDaLista(lista)}`} aria-hidden="true"></i>
        </span>
      </div>
      <div className="px-2 pt-3 pb-1">
        <div className="d-flex align-items-center gap-2">
          <h3 className="fb-cartao-titulo mb-0" style={{ fontSize: '1.15rem' }}>{lista.nome}</h3>
          {!lista.publica && (
            <i className="bi bi-lock-fill fb-apagado" title="Lista privada" aria-label="Lista privada"></i>
          )}
        </div>
        <div className="fb-cartao-meta mt-1">
          {textoQuantidade(lista.totalRestaurantes)}
          {mostrarDono && <> · de {lista.dono.nome} {lista.dono.oficial && <SeloOficial compacto />}</>}
        </div>
      </div>
    </Link>
  )
}