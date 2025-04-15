// Servidor Express simplificado
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'acessar.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log('=============================================');
  console.log(`Servidor iniciado em http://localhost:${port}`);
  console.log('=============================================');
}); 