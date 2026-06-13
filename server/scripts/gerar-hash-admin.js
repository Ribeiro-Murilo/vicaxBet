// Gera um hash bcrypt para usar no seed.sql
// Uso: node server/scripts/gerar-hash-admin.js [senha]
import bcrypt from 'bcryptjs';

const senha = process.argv[2] || 'admin';
const hash = bcrypt.hashSync(senha, 8);
console.log(`Senha: ${senha}`);
console.log(`Hash:  ${hash}`);
