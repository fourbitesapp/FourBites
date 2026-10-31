import { useEffect, useRef, useState } from 'react'

// Janela para ajustar a foto de perfil antes de enviar

const AREA = 280 // tamanho, em px, do quadrado de recorte na tela
const SAIDA = 512 // tamanho, em px, da imagem que é enviada
const ZOOM_MAXIMO = 3

export default function AjustarFoto({ arquivo, aoConfirmar, aoCancelar }) {
  const [url] = useState(() => URL.createObjectURL(arquivo))
  const [imagem, setImagem] = useState(null) // { largura, altura, elemento }
  const [zoom, setZoom] = useState(1)
  const [posicao, setPosicao] = useState({ x: 0, y: 0 }) // deslocamento do centro da foto, em px na tela
  const arrasto = useRef(null)

  // Libera a memória da imagem temporária ao fechar.
  useEffect(() => () => URL.revokeObjectURL(url), [url])

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape') aoCancelar()
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [aoCancelar])

  // Escala em que a foto cobre a área inteira (lado menor = AREA); o zoom multiplica a partir dela.
  const escalaBase = imagem ? Math.max(AREA / imagem.largura, AREA / imagem.altura) : 1
  const escala = escalaBase * zoom
  const largura = imagem ? imagem.largura * escala : AREA
  const altura = imagem ? imagem.altura * escala : AREA

  function limitar({ x, y }, l = largura, a = altura) {
    const maxX = (l - AREA) / 2
    const maxY = (a - AREA) / 2
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) }
  }

  function mudarZoom(novo) {
    const z = Math.min(ZOOM_MAXIMO, Math.max(1, novo))
    setZoom(z)
    setPosicao((p) => limitar(p, imagem.largura * escalaBase * z, imagem.altura * escalaBase * z))
  }

  function comecarArrasto(evento) {
    evento.currentTarget.setPointerCapture(evento.pointerId)
    arrasto.current = { x: evento.clientX - posicao.x, y: evento.clientY - posicao.y }
  }

  function arrastar(evento) {
    if (!arrasto.current) return
    setPosicao(limitar({ x: evento.clientX - arrasto.current.x, y: evento.clientY - arrasto.current.y }))
  }

  function moverComTeclado(evento) {
    const passo = 10
    const setas = { ArrowLeft: [passo, 0], ArrowRight: [-passo, 0], ArrowUp: [0, passo], ArrowDown: [0, -passo] }
    if (!setas[evento.key]) return
    evento.preventDefault()
    const [dx, dy] = setas[evento.key]
    setPosicao((p) => limitar({ x: p.x + dx, y: p.y + dy }))
  }

  function confirmar() {
    const origemX = (largura / 2 - AREA / 2 - posicao.x) / escala
    const origemY = (altura / 2 - AREA / 2 - posicao.y) / escala
    const lado = AREA / escala

    const canvas = document.createElement('canvas')
    canvas.width = SAIDA
    canvas.height = SAIDA
    const contexto = canvas.getContext('2d')
    contexto.fillStyle = '#ffffff' // fundo branco para PNG com transparência
    contexto.fillRect(0, 0, SAIDA, SAIDA)
    contexto.drawImage(imagem.elemento, origemX, origemY, lado, lado, 0, 0, SAIDA, SAIDA)
    canvas.toBlob((blob) => {
      aoConfirmar(new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="fb-janela-fundo" role="presentation" onClick={aoCancelar}>
      <div className="fb-janela fb-ajustar-foto" role="dialog" aria-modal="true" aria-labelledby="titulo-ajustar-foto"
        onClick={(e) => e.stopPropagation()}>
        <h2 id="titulo-ajustar-foto" style={{ fontSize: '1.6rem' }}>Ajustar foto</h2>
        <p className="fb-cartao-meta mb-3">Arraste a foto para posicionar e use a barra para aproximar.</p>

        <div className="fb-ajustar-area" style={{ width: AREA, height: AREA }} tabIndex={0}
          aria-label="Área da foto. Use as setas do teclado para mover."
          onPointerDown={comecarArrasto} onPointerMove={arrastar}
          onPointerUp={() => { arrasto.current = null }} onPointerCancel={() => { arrasto.current = null }}
          onWheel={(e) => imagem && mudarZoom(zoom - e.deltaY * 0.002)} onKeyDown={moverComTeclado}>
          <img src={url} alt="" draggable="false"
            onLoad={(e) => setImagem({ largura: e.target.naturalWidth, altura: e.target.naturalHeight, elemento: e.target })}
            style={{
              width: largura, height: altura,
              transform: `translate(calc(-50% + ${posicao.x}px), calc(-50% + ${posicao.y}px))`,
            }} />
          <span className="fb-ajustar-circulo" aria-hidden="true"></span>
        </div>

        <label className="fb-ajustar-zoom">
          <i className="bi bi-zoom-out" aria-hidden="true"></i>
          <input type="range" min="1" max={ZOOM_MAXIMO} step="0.01" value={zoom} aria-label="Aproximar"
            onChange={(e) => mudarZoom(Number(e.target.value))} disabled={!imagem} />
          <i className="bi bi-zoom-in" aria-hidden="true"></i>
        </label>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="fb-botao fb-botao-claro" onClick={aoCancelar}>Cancelar</button>
          <button type="button" className="fb-botao fb-botao-principal" onClick={confirmar} disabled={!imagem}>
            Usar esta foto
          </button>
        </div>
      </div>
    </div>
  )
}
