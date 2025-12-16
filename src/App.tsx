import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Layout>
      <div className="dashboard">
        <h1>Service Administration</h1>
        <p style={{ marginTop: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Select a service from the navigation menu to manage and oversee operations.
        </p>
        <div className="stats-grid" style={{ marginTop: '2rem' }}>
          <div className="stat-card">
            <h3>Email Service</h3>
            <div className="value">-</div>
          </div>
          <div className="stat-card">
            <h3>KYC Service</h3>
            <div className="value">-</div>
          </div>
          <div className="stat-card">
            <h3>Bank Service</h3>
            <div className="value">-</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;

