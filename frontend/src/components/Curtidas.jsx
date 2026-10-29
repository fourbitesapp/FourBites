import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";
import * as api from "../services/apiReal.js";
import JanelaPessoas from "./JanelaPessoas.jsx";

// Rodapé do cartão de avaliação: coração para curtir e o número de curtidas
// Clicar no número abre a lista de quem curtiu
export default function Curtidas({ avaliacao }) {
  const { usuario, logado } = useAuth();
  const { pathname } = useLocation();
  const [curtidas, setCurtidas] = useState(avaliacao.curtidas ?? 0);
  const [curtiu, setCurtiu] = useState(Boolean(avaliacao.curtiu));
  const [enviando, setEnviando] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);

  const podeCurtir =
    logado &&
    usuario.papel === "USUARIO" &&
    usuario.id !== avaliacao.usuario.id;

  async function alternar() {
    if (enviando) return;
    const curtirAgora = !curtiu;
    // Atualiza na hora e desfaz se a API der erro.
    setCurtiu(curtirAgora);
    setCurtidas((total) => total + (curtirAgora ? 1 : -1));
    setEnviando(true);
    try {
      await (curtirAgora
        ? api.curtir(avaliacao.id)
        : api.descurtir(avaliacao.id));
    } catch {
      setCurtiu(!curtirAgora);
      setCurtidas((total) => total + (curtirAgora ? -1 : 1));
    } finally {
      setEnviando(false);
    }
  }

  const texto = `${curtidas} ${curtidas === 1 ? "curtida" : "curtidas"}`;

  return (
    <div className="fb-curtidas">
      {podeCurtir && (
        <button
          type="button"
          className={`fb-coracao ${curtiu ? "curtido" : ""}`}
          onClick={alternar}
          aria-pressed={curtiu}
          aria-label={curtiu ? "Descurtir" : "Curtir"}
          title={curtiu ? "Descurtir" : "Curtir"}
        >
          <i
            className={curtiu ? "bi bi-heart-fill" : "bi bi-heart"}
            aria-hidden="true"
          ></i>
        </button>
      )}
      {!logado && (
        <Link
          to="/login"
          state={{
            voltarPara: pathname,
            aviso: "Entre na sua conta para curtir avaliações.",
          }}
          className="fb-coracao"
          aria-label="Entrar para curtir"
          title="Entrar para curtir"
        >
          <i className="bi bi-heart" aria-hidden="true"></i>
        </Link>
      )}
      {logado && !podeCurtir && (
        <span className="fb-coracao fb-coracao-fixo" aria-hidden="true">
          <i className="bi bi-heart"></i>
        </span>
      )}

      {curtidas > 0 ? (
        <button
          type="button"
          className="fb-botao-texto fb-total-curtidas"
          onClick={() => setMostrarLista(true)}
        >
          {texto}
        </button>
      ) : (
        <span className="fb-total-curtidas fb-apagado">{texto}</span>
      )}

      {mostrarLista && (
        <JanelaPessoas
          titulo="Curtidas"
          carregar={() => api.listarCurtidas(avaliacao.id)}
          vazio="Ninguém curtiu ainda."
          aoFechar={() => setMostrarLista(false)}
        />
      )}
    </div>
  );
}
