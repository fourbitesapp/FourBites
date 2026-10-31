import { iniciais } from '../utils/formatos.js'
import { foto as fotoReduzida } from '../utils/imagens.js'

// Foto de perfil; sem foto, mostra as iniciais do nome.
export default function Avatar({ nome, foto, tamanho = '' }) {
  const classe = `fb-avatar ${tamanho ? `fb-avatar-${tamanho}` : ''}`
  if (foto) {
    return <img src={fotoReduzida(foto, 240)} alt="" className={`${classe} fb-avatar-foto`} />
  }
  return <span className={classe}>{iniciais(nome)}</span>
}

