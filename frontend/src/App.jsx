import { useEffect, useState } from "react";

function App() {
  console.log("MEU APP ESTÁ RODANDO!");

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    console.log("USEEFFECT ESTÁ RODANDO!");

    fetch("http://localhost:8080/usuarios")
      .then((resposta) => {
        console.log("CHEGOU A RESPOSTA DO BACKEND!");
        console.log("Status:", resposta.status);
        console.log("Resposta:", resposta);

        return resposta.json();
      })
      .then((dados) => {
        console.log("CHEGARAM OS USUÁRIOS!");
        console.log("Dados:", dados);

        setUsuarios(dados);
      })
      .catch((erro) => {
        console.log("DEU ERRO NO FETCH!");
        console.error("Erro:", erro);
      });
  }, []);

  return (
    <div>
      {" "}
      <h1>FourBites</h1>
      ```
      <h2>Usuários cadastrados</h2>
      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        usuarios.map((usuario) => (
          <div key={usuario.id}>
            <h3>{usuario.nome}</h3>
            <p>@{usuario.username}</p>
            <p>{usuario.email}</p>
            <p>{usuario.bio}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
