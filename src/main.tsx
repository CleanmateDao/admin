import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QueryProvider from './providers/QueryProvider';
import App from './App';
import EmailPage from './pages/EmailPage';
import KycPage from './pages/KycPage';
import BankPage from './pages/BankPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/bank" element={<BankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>
);

