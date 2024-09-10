const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

const keycloakHost = process.env.HOST_KEYCLOAK;
const realm = process.env.REALM;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Rota principal que redireciona para o login do Keycloak
app.get('/', (req, res) => {
  const authUrl = `${keycloakHost}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:${port}/login/callback`;
  res.redirect(authUrl);
});

// Rota de callback para receber o code e solicitar o token
app.get('/login/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Code não encontrado!');
  }

  try {
    const tokenUrl = `${keycloakHost}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', `http://localhost:${port}/login/callback`);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send('Erro ao obter o token!');
  }
});

// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
