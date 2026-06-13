import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Jogos from './pages/Jogos.jsx';
import MinhasApostas from './pages/MinhasApostas.jsx';
import Rankings from './pages/Rankings.jsx';
import Admin from './pages/Admin.jsx';

function Protegida({ children }) {
  const { user, carregando } = useAuth();
  if (carregando) return <div className="container">Carregando a banca...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Navbar() {
  const { user, sair } = useAuth();
  const loc = useLocation();
  if (!user || loc.pathname === '/login') return null;
  return (
    <nav className="navbar">
      <span className="logo">vicaxBet</span>
      <div className="links">
        <Link to="/">Jogos</Link>
        <Link to="/apostas">Minhas Apostas</Link>
        <Link to="/rankings">Rankings</Link>
        {user.is_admin ? <Link to="/admin">Cartola</Link> : null}
      </div>
      <div className="saldo">
        <span className="pp">{user.pontos_principais} PP</span>
        <span className="fa">{user.fichas} FA</span>
        <button onClick={sair}>Sair</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protegida><Jogos /></Protegida>} />
        <Route path="/apostas" element={<Protegida><MinhasApostas /></Protegida>} />
        <Route path="/rankings" element={<Protegida><Rankings /></Protegida>} />
        <Route path="/admin" element={<Protegida><Admin /></Protegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="rodape">
        vicaxBet &copy; - A unica bet onde voce so perde tempo, nao dinheiro.
        Jogue com responsabilidade (ou nao, e de mentira).
      </footer>
    </>
  );
}
