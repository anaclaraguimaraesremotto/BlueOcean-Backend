const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken'); 

const app = express();
const PORT = 3000;
const SECRET_KEY = '222'; 

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, nome_usuario TEXT, user TEXT, email TEXT, senha_hash TEXT)');
  db.run('CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, mensagem TEXT, user TEXT)');
});

const verifyUser = (email, senha_hash, callback) => {
  db.get('SELECT * FROM users WHERE email = ? AND senha_hash = ?', [email, senha_hash], callback);
};

app.post('/api/login', (req, res) => {
  const { email, senha_hash } = req.body;

  verifyUser(email, senha_hash, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro no servidor' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ user, token });
  });
});

app.post('/api/cadastro', (req, res) => {
  const { nome_usuario, user, email, senha_hash, confirma_senha_hash } = req.body;
  
  if (senha_hash !== confirma_senha_hash) {
    return res.status(400).json({ message: 'As senhas não coincidem' });
  }

  db.run('INSERT INTO users (nome_usuario, user, email, senha_hash) VALUES (?, ?, ?, ?)', [nome_usuario, user, email, senha_hash], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao cadastrar' });
    }
    const newUser = { id: this.lastID, nome_usuario, user, email };
    res.json({ user: newUser, token: jwt.sign({ userId: this.lastID, email }, SECRET_KEY, { expiresIn: '1h' }) });
  });
});

app.post('/api/home', (req, res) => {
  const { mensagem, user } = req.body;
  db.run('INSERT INTO messages (mensagem, user) VALUES (?, ?)', [mensagem, user], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao enviar a mensagem' });
    }
    res.json({ id: this.lastID, mensagem, user });
  });
});

app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar mensagens' });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
