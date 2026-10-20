import { corDaCapa, fraseDaCapa } from '../utils/capas.js'

// Capa colorida do perfil, com bolinhas e a frase escolhida.
export default function CapaPerfil({ cor, frase, pequena = false }) {
  const capa = corDaCapa(cor)
  const [b1, b2, b3] = capa.bolhas
  const escala = pequena ? 0.6 : 1
  const px = (valor) => `${valor * escala}px`

  return (
    <div className={`fb-perfil-capa ${pequena ? 'fb-perfil-capa-pequena' : ''}`} style={{ background: capa.fundo }}>
      <span className="fb-bolha" aria-hidden="true" style={{ right: px(80), top: px(-40), width: px(160), height: px(160), background: b1 }}></span>
      <span className="fb-bolha" aria-hidden="true" style={{ right: px(260), bottom: px(-50), width: px(120), height: px(120), background: b2 }}></span>
      <span className="fb-bolha" aria-hidden="true" style={{ right: px(30), bottom: px(24), width: px(54), height: px(54), background: b3 }}></span>
      <span className="fb-mao" style={{ color: capa.texto }}>{fraseDaCapa(frase)}</span>
    </div>
  )
}