import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">Admin Dashboard</div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/email" className={`nav-link ${location.pathname === '/email' ? 'active' : ''}`}>
          Email
        </Link>
        <Link to="/kyc" className={`nav-link ${location.pathname === '/kyc' ? 'active' : ''}`}>
          KYC
        </Link>
        <Link to="/bank" className={`nav-link ${location.pathname === '/bank' ? 'active' : ''}`}>
          Bank
        </Link>
      </div>
    </nav>
  );
}

