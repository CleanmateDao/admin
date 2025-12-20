import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  VeChainKitProvider,
  TransactionModalProvider,
} from "@vechain/vechain-kit";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import StreaksPage from "./pages/StreaksPage";
import StreakDetailPage from "./pages/StreakDetailPage";
import CleanupsPage from "./pages/CleanupsPage";
import CleanupDetailPage from "./pages/CleanupDetailPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import EmailPage from "./pages/EmailPage";
import KycPage from "./pages/KycPage";
import KycDetailPage from "./pages/KycDetailPage";
import BankPage from "./pages/BankPage";
import RewardsManagerPage from "./pages/RewardsManagerPage";
import "./tailwind.css";
import "./index.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <VeChainKitProvider
          feeDelegation={{
            delegatorUrl: import.meta.env.VITE_DELEGATOR_URL!,
            delegateAllTransactions: true,
            b3trTransfers: { minAmountInEther: 1 },
          }}
          dappKit={{
            allowedWallets: ["veworld", "sync2", "wallet-connect"],
            walletConnectOptions: {
              projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
              metadata: {
                name: "CleanMate Admin",
                description: "CleanMate Admin - Service Administration",
                url: window.location.origin,
                icons: [`${window.location.origin}/logo.png`],
              },
            },
            usePersistence: true,
            useFirstDetectedSource: false,
          }}
          loginMethods={[
            { method: "vechain", gridColumn: 4 },
            { method: "dappkit", gridColumn: 4 },
            { method: "ecosystem", gridColumn: 4 },
          ]}
          loginModalUI={{
            description:
              "Choose between social login through VeChain or by connecting your wallet.",
          }}
          network={{ type: import.meta.env.VITE_VECHAIN_NETWORK }}
          allowCustomTokens={false}
        >
          <TransactionModalProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="dashboard">
                        <p className="mt-4 text-muted-foreground">
                          Select a service from the navigation menu to manage
                          and oversee operations.
                        </p>
                        <div className="stats-grid mt-8">
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
                          <div className="stat-card">
                            <h3>Streaks</h3>
                            <div className="value">-</div>
                          </div>
                          <div className="stat-card">
                            <h3>Cleanups</h3>
                            <div className="value">-</div>
                          </div>
                          <div className="stat-card">
                            <h3>Users</h3>
                            <div className="value">-</div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <Route path="/streaks" element={<StreaksPage />} />
                  <Route path="/streaks/:id" element={<StreakDetailPage />} />
                  <Route path="/cleanups" element={<CleanupsPage />} />
                  <Route path="/cleanups/:id" element={<CleanupDetailPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route path="/email" element={<EmailPage />} />
                  <Route path="/kyc" element={<KycPage />} />
                  <Route path="/kyc/:id" element={<KycDetailPage />} />
                  <Route path="/bank" element={<BankPage />} />
                  <Route path="/rewards" element={<RewardsManagerPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TransactionModalProvider>
        </VeChainKitProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
