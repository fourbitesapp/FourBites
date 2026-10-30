// Quem pode usar os recursos de usuário:
// a conta de usuário e também o admin, que é o perfil oficial do FourBites
// Conta de restaurante não tem esses recursos
export function temRecursosDeUsuario(usuario) {
  return usuario?.papel === 'USUARIO' || usuario?.papel === 'ADMIN'
}
