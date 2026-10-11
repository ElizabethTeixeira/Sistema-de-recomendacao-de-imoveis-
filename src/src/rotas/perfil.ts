import { Router } from 'express';

const rotasPerfil = Router();

rotasPerfil.get('/perfil', (req, res) => {
  return res.json({
    id: "1",
    nome: "Regina Santos",
    email: "reginnasantos88@gmail.com",
    status: "Perfil US13 Implementado com Sucesso"
  });
});

export default rotasPerfil;
