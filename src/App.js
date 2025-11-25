import { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import HistoryList from "./components/HistoryList";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="app-background">
        <div className="floating-car">🚗</div>
        <div className="floating-car">🚙</div>
        <div className="floating-car">🏎️</div>
        <div className="floating-icon">🅿️</div>
        <div className="floating-icon">💰</div>
        <div className="floating-icon">⏱️</div>
      </div>

      {/* Enhanced Navigation Bar */}
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">🅿️</span>
            <span className="brand-text">ParkingPro</span>
          </div>
          
          <div className="nav-links">
            <button
              onClick={() => setActivePage("home")}
              className={`nav-link ${activePage === "home" ? "active" : ""}`}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Dashboard</span>
            </button>

            <button
              onClick={() => setActivePage("transactions")}
              className={`nav-link ${activePage === "transactions" ? "active" : ""}`}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Transactions</span>
            </button>

            <button
              onClick={() => setActivePage("history")}
              className={`nav-link ${activePage === "history" ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">History</span>
            </button>
          </div>

          <div className="nav-actions">
            <button 
              onClick={() => setRefreshKey(refreshKey + 1)}
              className="refresh-btn"
            >
              <span className="refresh-icon">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activePage === "home" && (
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">
                <span className="title-icon">🏠</span>
                Parking Dashboard
              </h1>
              <p className="page-subtitle">
                Manage your parking operations efficiently
              </p>
            </div>
            <TransactionForm onAdded={() => setRefreshKey(refreshKey + 1)} />
          </div>
        )}

        {activePage === "transactions" && (
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">
                <span className="title-icon">📋</span>
                Live Transactions
              </h1>
              <p className="page-subtitle">
                Monitor and manage current parking sessions
              </p>
            </div>
            <TransactionList key={refreshKey} />
          </div>
        )}

        {activePage === "history" && (
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">
                <span className="title-icon">📊</span>
                Transaction History
              </h1>
              <p className="page-subtitle">
                Analyze past parking sessions and revenue
              </p>
            </div>
            <HistoryList />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">🅿️</span>
            <span className="brand-text">ParkingPro System</span>
          </div>
          <div className="footer-links">
            <span className="footer-text">Smart Parking Management</span>
            <span className="footer-version">v2.0.1</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        /* Animated Background */
        .app-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .floating-car, .floating-icon {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 20s infinite linear;
        }

        .floating-car:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
        .floating-car:nth-child(2) { top: 60%; left: 80%; animation-delay: 5s; }
        .floating-car:nth-child(3) { top: 30%; left: 90%; animation-delay: 10s; }
        .floating-icon:nth-child(4) { top: 80%; left: 15%; animation-delay: 15s; }
        .floating-icon:nth-child(5) { top: 40%; left: 70%; animation-delay: 7s; }
        .floating-icon:nth-child(6) { top: 70%; left: 40%; animation-delay: 12s; }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }

        /* Navigation Styles */
        .app-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          font-size: 1.5rem;
          color: #1f2937;
        }

        .brand-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          padding: 8px;
          border-radius: 12px;
          color: white;
        }

        .brand-text {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          color: #6b7280;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .nav-link:hover {
          background: #f8faff;
          color: #4f46e5;
          transform: translateY(-2px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-text {
          font-size: 0.95rem;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .refresh-icon {
          font-size: 1.1rem;
        }

        /* Main Content Styles */
        .app-main {
          position: relative;
          z-index: 10;
          min-height: calc(100vh - 140px);
          padding: 0;
        }

        .page-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .title-icon {
          font-size: 3.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .page-subtitle {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-weight: 300;
        }

        /* Footer Styles */
        .app-footer {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 100;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #1f2937;
        }

        .footer-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .footer-text {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .footer-version {
          font-size: 0.8rem;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .nav-container {
            flex-direction: column;
            height: auto;
            padding: 15px 20px;
            gap: 15px;
          }

          .nav-links {
            order: 2;
          }

          .nav-actions {
            order: 3;
          }

          .page-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 20px 15px;
          }

          .page-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
          }

          .title-icon {
            font-size: 3rem;
          }

          .page-subtitle {
            font-size: 1.1rem;
          }

          .nav-links {
            flex-direction: column;
            width: 100%;
          }

          .nav-link {
            width: 100%;
            justify-content: center;
          }

          .footer-content {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .brand-text {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.8rem;
          }

          .title-icon {
            font-size: 2.5rem;
            padding: 12px;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .nav-brand {
            font-size: 1.3rem;
          }
        }

        /* Smooth transitions for page changes */
        .page-content {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}