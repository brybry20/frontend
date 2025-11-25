import { useEffect, useState } from "react";
import { fetchTransactions, updateTransaction } from "./services/api";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [exitTime, setExitTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  function openModal(transaction) {
    setSelected(transaction);
    setExitTime(transaction.exit_time || "");
    setIsOpen(true);
  }

  async function handleUpdate() {
    if (!selected) return;
    try {
      await updateTransaction(selected.id, {
        ...selected,
        exit_time: exitTime,
      });
      setIsOpen(false);
      loadTransactions();
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  }

  // Calculate revenue for a single transaction (20 pesos per hour)
  const calculateRevenue = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return 0;
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const hours = Math.ceil((exit - entry) / (1000 * 60 * 60));
    const rate = 20; // 20 pesos per hour
    return Math.max(0, hours * rate);
  };

  // Calculate total revenue from all completed transactions
  const calculateTotalRevenue = () => {
    return transactions
      .filter(t => t.exit_time)
      .reduce((total, transaction) => {
        return total + calculateRevenue(transaction.entry_time, transaction.exit_time);
      }, 0);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = activeFilter === "all" ? true : 
                         activeFilter === "active" ? !transaction.exit_time : 
                         transaction.exit_time;
    
    const matchesSearch = transaction.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.parking_slot?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const activeCount = transactions.filter(t => !t.exit_time).length;
  const completedCount = transactions.filter(t => t.exit_time).length;
  const totalRevenue = calculateTotalRevenue();

  const vehicleIcons = {
    motorcycle: "🏍️",
    car: "🚗",
    bike: "🚴",
    "e-bike": "🛴",
    truck: "🚚"
  };

  const getVehicleTypeCount = (type) => {
    return transactions.filter(t => t.vehicle_type === type).length;
  };

  return (
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="dashboard-background">
        <div className="floating-icon">🅿️</div>
        <div className="floating-icon">🚗</div>
        <div className="floating-icon">🚙</div>
        <div className="floating-icon">🏎️</div>
      </div>

      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-main">
            <div className="header-title">
              <h1 className="main-title">
                <span className="title-icon">📊</span>
                Parking Dashboard
              </h1>
              <p className="subtitle">Real-time parking management and analytics</p>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search vehicles, owners, plates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button onClick={loadTransactions} className="refresh-btn">
                <span className="refresh-icon">🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-content">
              <div className="stat-icon">🅿️</div>
              <div className="stat-details">
                <div className="stat-number">{transactions.length}</div>
                <div className="stat-label">Total Vehicles</div>
              </div>
            </div>
            <div className="stat-trend">📈 All time</div>
          </div>

          <div className="stat-card success">
            <div className="stat-content">
              <div className="stat-icon">🟢</div>
              <div className="stat-details">
                <div className="stat-number">{activeCount}</div>
                <div className="stat-label">Currently Parked</div>
              </div>
            </div>
            <div className="stat-trend">🚗 Active now</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-content">
              <div className="stat-icon">💰</div>
              <div className="stat-details">
                <div className="stat-number">₱{totalRevenue}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="stat-trend">💳 20/hour</div>
          </div>

          <div className="stat-card info">
            <div className="stat-content">
              <div className="stat-icon">⏱️</div>
              <div className="stat-details">
                <div className="stat-number">{completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-trend">✅ This week</div>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="distribution-section">
          <h3 className="section-title">Vehicle Distribution</h3>
          <div className="distribution-grid">
            <div className="distribution-item">
              <span className="dist-icon">🚗</span>
              <span className="dist-count">{getVehicleTypeCount("car")}</span>
              <span className="dist-label">Cars</span>
            </div>
            <div className="distribution-item">
              <span className="dist-icon">🏍️</span>
              <span className="dist-count">{getVehicleTypeCount("motorcycle")}</span>
              <span className="dist-label">Motorcycles</span>
            </div>
            <div className="distribution-item">
              <span className="dist-icon">🚚</span>
              <span className="dist-count">{getVehicleTypeCount("truck")}</span>
              <span className="dist-label">Trucks</span>
            </div>
            <div className="distribution-item">
              <span className="dist-icon">🚴</span>
              <span className="dist-count">{getVehicleTypeCount("bike") + getVehicleTypeCount("e-bike")}</span>
              <span className="dist-label">Bikes</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Filter Tabs */}
          <div className="content-header">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                <span className="tab-icon">📋</span>
                All Transactions
                <span className="tab-count">{transactions.length}</span>
              </button>
              <button
                className={`filter-tab ${activeFilter === "active" ? "active" : ""}`}
                onClick={() => setActiveFilter("active")}
              >
                <span className="tab-icon">🟢</span>
                Currently Parked
                <span className="tab-count">{activeCount}</span>
              </button>
              <button
                className={`filter-tab ${activeFilter === "completed" ? "active" : ""}`}
                onClick={() => setActiveFilter("completed")}
              >
                <span className="tab-icon">✅</span>
                Completed
                <span className="tab-count">{completedCount}</span>
              </button>
            </div>
            
            <div className="results-info">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>

          {/* Transactions Table */}
          <div className="table-card">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">🔄</div>
                <p>Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚗</div>
                <h3>No transactions found</h3>
                <p>
                  {searchTerm ? "No results match your search." :
                  activeFilter === "all" 
                    ? "No parking transactions recorded yet." 
                    : activeFilter === "active" 
                    ? "No vehicles currently parked."
                    : "No completed transactions yet."}
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th className="table-header">Vehicle</th>
                      <th className="table-header">Owner</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Plate</th>
                      <th className="table-header">Slot</th>
                      <th className="table-header">Entry Time</th>
                      <th className="table-header">Exit Time</th>
                      <th className="table-header">Duration</th>
                      <th className="table-header">Revenue</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const entryTime = new Date(transaction.entry_time);
                      const exitTime = transaction.exit_time ? new Date(transaction.exit_time) : new Date();
                      const durationMs = exitTime - entryTime;
                      const durationMinutes = Math.round(durationMs / (1000 * 60));
                      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
                      const revenue = calculateRevenue(transaction.entry_time, transaction.exit_time);
                      
                      return (
                        <tr key={transaction.id} className="table-row">
                          <td className="table-cell">
                            <div className="vehicle-info">
                              <span className="vehicle-icon">
                                {vehicleIcons[transaction.vehicle_type] || "🚗"}
                              </span>
                              <div className="vehicle-details">
                                <span className="vehicle-name">
                                  {transaction.vehicle_name}
                                </span>
                                <span className="vehicle-type">
                                  {transaction.vehicle_type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="owner-info">
                              <span className="owner-name">{transaction.owner_name}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="type-badge">
                              {transaction.vehicle_type}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="plate-number">
                              {transaction.plate_number}
                            </span>
                          </td>
                          <td className="table-cell">
                            {transaction.parking_slot ? (
                              <span className="slot-badge active-slot">
                                🅿️ {transaction.parking_slot}
                              </span>
                            ) : (
                              <span className="slot-badge available-slot">
                                ✅ Available
                              </span>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="time-info">
                              <span className="time-icon">🕐</span>
                              {entryTime.toLocaleTimeString()}
                            </div>
                            <div className="date-info">
                              {entryTime.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="table-cell">
                            {transaction.exit_time ? (
                              <div className="time-info exited">
                                <span className="time-icon">🚪</span>
                                {exitTime.toLocaleTimeString()}
                                <div className="date-info">
                                  {exitTime.toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="no-exit">—</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="duration-info">
                              {transaction.exit_time ? (
                                <>
                                  <span className="duration-value">{durationMinutes}m</span>
                                  <span className="duration-label">parked</span>
                                </>
                              ) : (
                                <>
                                  <span className="duration-value active">{durationMinutes}m</span>
                                  <span className="duration-label">so far</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="revenue-info">
                              {transaction.exit_time ? (
                                <>
                                  <span className="revenue-amount">₱{revenue}</span>
                                  <span className="revenue-label">{durationHours}h × ₱20</span>
                                </>
                              ) : (
                                <>
                                  <span className="revenue-amount pending">—</span>
                                  <span className="revenue-label">pending</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            {transaction.exit_time ? (
                              <span className="status-badge completed">
                                <span className="status-dot"></span>
                                Completed
                              </span>
                            ) : (
                              <span className="status-badge active">
                                <span className="status-dot"></span>
                                Parked
                              </span>
                            )}
                          </td>
                          <td className="table-cell">
                            {!transaction.exit_time && (
                              <button
                                onClick={() => openModal(transaction)}
                                className="action-button timeout-btn"
                              >
                                <span className="button-icon">⏱️</span>
                                Time Out
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Update Modal */}
        {isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  <span className="modal-icon">⏱️</span>
                  Set Exit Time
                </h3>
                <p className="modal-subtitle">
                  Complete parking session for <strong>{selected?.plate_number}</strong>
                </p>
              </div>
              
              <div className="modal-body">
                <div className="vehicle-summary">
                  <div className="vehicle-card">
                    <div className="vehicle-header">
                      <span className="vehicle-icon-large">
                        {vehicleIcons[selected?.vehicle_type] || "🚗"}
                      </span>
                      <div className="vehicle-info-large">
                        <div className="vehicle-name-large">{selected?.vehicle_name}</div>
                        <div className="vehicle-owner">{selected?.owner_name}</div>
                      </div>
                    </div>
                    <div className="vehicle-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Parking Slot:</span>
                        <span className="detail-value badge">{selected?.parking_slot}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Entry Time:</span>
                        <span className="detail-value">
                          {selected ? new Date(selected.entry_time).toLocaleString() : ''}
                        </span>
                      </div>
                      {selected && (
                        <div className="detail-item">
                          <span className="detail-label">Est. Revenue:</span>
                          <span className="detail-value revenue-estimate">
                            ₱{calculateRevenue(selected.entry_time, exitTime || new Date().toISOString())}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="time-input-section">
                  <label className="time-label">
                    <span className="label-icon">🚪</span>
                    Exit Time
                  </label>
                  <input
                    type="datetime-local"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="time-input"
                  />
                  <div className="rate-info">
                    💰 Rate: ₱20 per hour (rounded up)
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setIsOpen(false)}
                  className="modal-btn cancel-btn"
                >
                  <span className="btn-icon">❌</span>
                  Cancel  
                </button>
                <button
                  onClick={handleUpdate}
                  className="modal-btn confirm-btn"
                >
                  <span className="btn-icon">💾</span>
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        /* Dashboard Background */
        .dashboard-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .floating-icon {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 20s infinite linear;
        }

        .floating-icon:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
        .floating-icon:nth-child(2) { top: 60%; left: 80%; animation-delay: 5s; }
        .floating-icon:nth-child(3) { top: 30%; left: 90%; animation-delay: 10s; }
        .floating-icon:nth-child(4) { top: 80%; left: 15%; animation-delay: 15s; }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }

        .dashboard-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header Styles */
        .dashboard-header {
          margin-bottom: 24px;
        }

        .header-main {
          display: flex;
          justify-content: between;
          align-items: flex-start;
          gap: 24px;
        }

        .header-title {
          flex: 1;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title-icon {
          font-size: 3rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-box {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 300px;
        }

        .search-icon {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9rem;
          color: #374151;
          flex: 1;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.primary { border-left: 4px solid #4f46e5; }
        .stat-card.success { border-left: 4px solid #10b981; }
        .stat-card.warning { border-left: 4px solid #f59e0b; }
        .stat-card.info { border-left: 4px solid #3b82f6; }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .stat-details {
          flex: 1;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-trend {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 600;
        }

        /* Distribution Section */
        .distribution-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .distribution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .distribution-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #f8faff;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .distribution-item:hover {
          background: #e0e7ff;
          transform: translateY(-2px);
        }

        .dist-icon {
          font-size: 2rem;
        }

        .dist-count {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
        }

        .dist-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
        }

        /* Main Content */
        .main-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .content-header {
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filter-tab {
          background: #f3f4f6;
          border: 2px solid transparent;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-tab:hover {
          background: #e5e7eb;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .tab-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .results-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 16px;
        }

        .table-card {
          padding: 0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: #f8faff;
          color: #374151;
          padding: 16px 12px;
          text-align: left;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.3s ease;
        }

        .table-row:hover {
          background: #f8faff;
        }

        .table-cell {
          padding: 16px 12px;
          color: #374151;
          font-weight: 500;
        }

        .vehicle-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vehicle-icon {
          font-size: 1.5rem;
        }

        .vehicle-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vehicle-name {
          font-weight: 600;
          color: #1f2937;
        }

        .vehicle-type {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: capitalize;
        }

        .owner-info {
          display: flex;
          flex-direction: column;
        }

        .owner-name {
          font-weight: 600;
          color: #1f2937;
        }

        .type-badge {
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .plate-number {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          color: #1f2937;
          letter-spacing: 1px;
        }

        .slot-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .active-slot {
          background: #d1fae5;
          color: #065f46;
        }

        .available-slot {
          background: #f3f4f6;
          color: #6b7280;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-info.exited {
          color: #6b7280;
        }

        .time-icon {
          font-size: 0.875rem;
        }

        .date-info {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .no-exit {
          color: #9ca3af;
          font-style: italic;
        }

        .duration-info, .revenue-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .duration-value {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .duration-value.active {
          color: #10b981;
        }

        .duration-label, .revenue-label {
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .revenue-amount {
          font-weight: 700;
          color: #10b981;
          font-size: 0.9rem;
        }

        .revenue-amount.pending {
          color: #9ca3af;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.completed {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-badge.active .status-dot {
          background: #10b981;
        }

        .status-badge.completed .status-dot {
          background: #6b7280;
        }

        .action-button {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .button-icon {
          font-size: 0.9rem;
        }

        /* Loading and Empty States */
        .loading-state, .empty-state {
          padding: 60px 40px;
          text-align: center;
          color: #6b7280;
        }

        .loading-spinner {
          font-size: 3rem;
          animation: spin 2s linear infinite;
          margin-bottom: 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #374151;
          margin: 0 0 8px 0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-header {
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-icon {
          font-size: 1.5rem;
        }

        .modal-subtitle {
          color: #6b7280;
          margin: 0;
        }

        .vehicle-summary {
          margin-bottom: 24px;
        }

        .vehicle-card {
          background: #f8faff;
          border-radius: 12px;
          padding: 20px;
        }

        .vehicle-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .vehicle-icon-large {
          font-size: 2.5rem;
        }

        .vehicle-info-large {
          flex: 1;
        }

        .vehicle-name-large {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .vehicle-owner {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .vehicle-details-grid {
          display: grid;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }

        .detail-value.badge {
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .detail-value.revenue-estimate {
          color: #10b981;
          font-size: 1.1rem;
        }

        .time-input-section {
          margin-bottom: 24px;
        }

        .time-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .label-icon {
          font-size: 1.1rem;
        }

        .time-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .time-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .rate-info {
          margin-top: 8px;
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .confirm-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .header-main {
            flex-direction: column;
          }
          
          .search-box {
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 10px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-tabs {
            flex-direction: column;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-content {
            margin: 20px;
            padding: 20px;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}