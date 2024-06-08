const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_usuario TEXT,
    user TEXT,
    email TEXT,
    senha_hash TEXT
  )`);

  db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mensagem TEXT,
    user TEXT
  )`);
});

module.exports = db;
