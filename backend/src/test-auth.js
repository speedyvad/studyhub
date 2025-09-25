const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyHub API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de registro simples
app.post('/api/auth/register', (req, res) => {
  console.log('Registro recebido:', req.body);
  res.json({
    success: true,
    message: 'Usuário criado com sucesso!',
    data: {
      user: {
        id: '1',
        name: req.body.name,
        email: req.body.email,
        points: 0,
        studyHours: 0,
        level: 1
      },
      token: 'fake-jwt-token'
    }
  });
});

// Rota de login simples
app.post('/api/auth/login', (req, res) => {
  console.log('Login recebido:', req.body);
  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    data: {
      user: {
        id: '1',
        name: 'João Silva',
        email: req.body.email,
        points: 1250,
        studyHours: 45.5,
        level: 3
      },
      token: 'fake-jwt-token'
    }
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 StudyHub API rodando na porta ${PORT}`);
  console.log(`🌐 CORS Origin: http://localhost:5174`);
});

