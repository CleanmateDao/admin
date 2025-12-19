import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div className="text-xl font-semibold text-foreground">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Home
          </Link>
          <Link
            to="/streaks"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname.startsWith("/streaks")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Streaks
          </Link>
          <Link
            to="/cleanups"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname.startsWith("/cleanups")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Cleanups
          </Link>
          <Link
            to="/users"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname.startsWith("/users")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Users
          </Link>
          <Link
            to="/email"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/email"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Email
          </Link>
          <Link
            to="/kyc"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/kyc"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            KYC
          </Link>
          <Link
            to="/bank"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/bank"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Bank
          </Link>
          <Link
            to="/rewards"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === "/rewards"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Rewards
          </Link>
        </div>
        <ThemeToggle />
        <WalletButton />
      </div>
    </nav>
  );
}
