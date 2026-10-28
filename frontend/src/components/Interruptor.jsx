// Botão liga/desliga (usado nos horários do formulário e no "visível no site" do admin).
export default function Interruptor({ ligado, aoMudar, textoLigado, textoDesligado, rotulo, desativado = false }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} className="fb-interruptor"
      disabled={desativado} onClick={() => aoMudar(!ligado)}>
      <span className="fb-trilho" aria-hidden="true"><span></span></span>
      {ligado ? textoLigado : textoDesligado}
    </button>
  )
}
