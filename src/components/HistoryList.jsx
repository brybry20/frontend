// src/components/HistoryList.jsx
import { useEffect, useState } from "react";
import { fetchHistory, deleteTransaction } from "./services/api";

export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("exit_time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  }

  // Delete transaction function
  const handleDeleteTransaction = async (transactionId) => {
    setDeletingId(transactionId);
    setError(null);
    try {
      await deleteTransaction(transactionId);
      // Remove the transaction from the local state
      setHistory(prev => prev.filter(transaction => transaction.id !== transactionId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete transaction. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Alternative delete function if API doesn't work
  const handleDeleteLocal = (transactionId) => {
    setDeletingId(transactionId);
    setError(null);
    try {
      // Remove from local state immediately
      setHistory(prev => prev.filter(transaction => transaction.id !== transactionId));
      setDeleteConfirm(null);
      
      // Try API call but don't wait for it
      deleteTransaction(transactionId).catch(apiErr => {
        console.error("API delete failed, but removed locally:", apiErr);
        setError("Transaction removed locally, but server sync failed");
      });
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHistory = history.filter(transaction =>
    transaction.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.parking_slot?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const vehicleIcons = {
    motorcycle: "🏍️",
    car: "🚗",
    bike: "🚴",
    "e-bike": "🛴",
    truck: "🚚"
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return "N/A";
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const durationMs = exit - entry;
    
    if (durationMs < 0) return "Invalid";
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateRevenue = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return 0;
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const hours = Math.ceil((exit - entry) / (1000 * 60 * 60));
    const rate = 20; // $5 per hour
    return Math.max(0, hours * rate);
  };

  const totalRevenue = history.reduce((total, transaction) => {
    return total + calculateRevenue(transaction.entry_time, transaction.exit_time);
  }, 0);

  // Individual Receipt Print Function
  const printIndividualReceipt = (transaction) => {
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      const duration = calculateDuration(transaction.entry_time, transaction.exit_time);
      const revenue = calculateRevenue(transaction.entry_time, transaction.exit_time);
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Parking Receipt - ${transaction.plate_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              background: white;
              font-size: 12px;
            }
            .receipt-container {
              max-width: 300px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 15px;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .double-divider {
              border-top: 2px solid #000;
              margin: 15px 0;
            }
            .transaction-details {
              margin: 15px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .detail-label {
              font-weight: bold;
            }
            .detail-value {
              text-align: right;
            }
            .vehicle-info {
              background: #f0f0f0;
              padding: 8px;
              margin: 10px 0;
              border-radius: 4px;
            }
            .amount-section {
              background: #000;
              color: white;
              padding: 10px;
              margin: 15px 0;
              text-align: center;
              border-radius: 4px;
            }
            .total-amount {
              font-size: 18px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              color: #666;
            }
            .barcode {
              text-align: center;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              letter-spacing: 2px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt-container { border: none; box-shadow: none; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-name">PARKING MANAGEMENT</div>
              <div class="receipt-title">OFFICIAL RECEIPT</div>
              <div>Receipt No: ${transaction.id || 'N/A'}</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="transaction-details">
              <div class="detail-row">
                <span class="detail-label">Plate Number:</span>
                <span class="detail-value">${transaction.plate_number || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Type:</span>
                <span class="detail-value">${transaction.vehicle_type?.toUpperCase() || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Parking Slot:</span>
                <span class="detail-value">${transaction.parking_slot || 'N/A'}</span>
              </div>
            </div>
            
            <div class="vehicle-info">
              <div><strong>Vehicle:</strong> ${transaction.vehicle_name || 'N/A'}</div>
              <div><strong>Owner:</strong> ${transaction.owner_name || 'N/A'}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="transaction-details">
              <div class="detail-row">
                <span class="detail-label">Entry Time:</span>
                <span class="detail-value">${transaction.entry_time ? new Date(transaction.entry_time).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Exit Time:</span>
                <span class="detail-value">${transaction.exit_time ? new Date(transaction.exit_time).toLocaleString() : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration}</span>
              </div>
            </div>
            
            <div class="double-divider"></div>
            
            <div class="amount-section">
              <div>TOTAL AMOUNT</div>
              <div class="total-amount">₱${revenue}</div>
            </div>
            
            <div class="barcode">
              *** ${transaction.id || 'TRANSACTION'} ***
            </div>
            
            <div class="footer">
              <div>Thank you for parking with us!</div>
              <div>For inquiries: contact@parkingmgmt.com</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Failed to print receipt:", error);
      alert("Failed to generate receipt. Please try again.");
    }
  };

  // PDF Export Function
  const exportToPDF = () => {
    setExportLoading(true);
    try {
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Parking Transaction History</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th { background: #374151; color: white; padding: 12px; text-align: left; font-size: 12px; }
            .table td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
            .table tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .summary { background: #f5f5f5 !important; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Parking Transaction History</div>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="summary">
            <div>Total Sessions: ${sortedHistory.length}</div>
            <div>Total Revenue: ₱${sortedHistory.reduce((total, transaction) => total + calculateRevenue(transaction.entry_time, transaction.exit_time), 0)}</div>
            <div>Generated By: Parking Management System</div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Type</th>
                <th>Plate</th>
                <th>Slot</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${sortedHistory.map(transaction => {
                const duration = calculateDuration(transaction.entry_time, transaction.exit_time);
                const revenue = calculateRevenue(transaction.entry_time, transaction.exit_time);
                return `
                  <tr>
                    <td>${transaction.vehicle_name || 'N/A'}</td>
                    <td>${transaction.owner_name || 'N/A'}</td>
                    <td>${transaction.vehicle_type || 'N/A'}</td>
                    <td>${transaction.plate_number || 'N/A'}</td>
                    <td>${transaction.parking_slot || 'N/A'}</td>
                    <td>${transaction.entry_time ? new Date(transaction.entry_time).toLocaleString() : 'N/A'}</td>
                    <td>${transaction.exit_time ? new Date(transaction.exit_time).toLocaleString() : 'N/A'}</td>
                    <td>${duration}</td>
                    <td>₱${revenue}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            This document was automatically generated by Parking Management System
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to generate PDF file");
    } finally {
      setExportLoading(false);
      setExportDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownOpen && !event.target.closest('.export-dropdown')) {
        setExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportDropdownOpen]);

  return (
    <div className="history-container">
      {/* Animated Background */}
      <div className="parking-background">
        <div className="parking-grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="parking-space">
              <div className="parking-line"></div>
            </div>
          ))}
        </div>
        
        {/* Moving Cars */}
        <div className="moving-car car-1">🚗</div>
        <div className="moving-car car-2">🚙</div>
        <div className="moving-car car-3">🏎️</div>
        
        {/* Parked Cars */}
        <div className="parked-car parked-1">🚘</div>
        <div className="parked-car parked-2">🚙</div>

        {/* Floating Icons */}
        <div className="floating-icon icon-1">📊</div>
        <div className="floating-icon icon-2">💰</div>
        <div className="floating-icon icon-3">⏱️</div>
      </div>

      <div className="history-content">
        {/* Header Section */}
        <div className="history-header">
          <div className="header-content">
            <h2 className="history-title">
              <span className="title-icon">📋</span>
              Transaction History
            </h2>
            <p className="history-subtitle">
              Complete record of all parking sessions and revenue
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-number">{history.length}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
            
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-number">₱{totalRevenue}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
            
            <div className="stat-card average">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-number">
                  {history.length > 0 
                    ? Math.round(history.reduce((acc, curr) => {
                        const duration = new Date(curr.exit_time) - new Date(curr.entry_time);
                        return acc + (duration / (1000 * 60 * 60));
                      }, 0) / history.length * 10) / 10
                    : 0
                  }h
                </div>
                <div className="stat-label">Avg. Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
            <button onClick={() => setError(null)} className="error-close">✕</button>
          </div>
        )}

        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search history by owner, vehicle, plate, or slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="exit_time">Sort by Exit Time</option>
              <option value="entry_time">Sort by Entry Time</option>
              <option value="owner_name">Sort by Owner</option>
              <option value="vehicle_name">Sort by Vehicle</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="sort-order-btn"
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>

            {/* Export Dropdown */}
            <div className="export-dropdown">
              <button 
                className="export-btn" 
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={exportLoading || sortedHistory.length === 0}
              >
                <span className="export-icon">📥</span>
                {exportLoading ? "Exporting..." : "Export"}
                <span className="dropdown-arrow">▼</span>
              </button>
              {exportDropdownOpen && (
                <div className="export-options">
                  <button onClick={exportToPDF} className="export-option">
                    <span className="export-option-icon">📄</span>
                    Export as PDF
                  </button>
                  <button 
                    onClick={() => setExportDropdownOpen(false)}
                    className="export-option close-option"
                  >
                    <span className="export-option-icon">✕</span>
                    Close
                  </button>
                </div>
              )}
            </div>

            <button onClick={loadHistory} className="refresh-btn">
              <span className="refresh-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">🔄</div>
              <p>Loading transaction history...</p>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No history found</h3>
              <p>
                {searchTerm 
                  ? "No transactions match your search criteria." 
                  : "No completed transactions recorded yet."
                }
              </p>
            </div>
          ) : (
            <table className="history-table">
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
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((transaction) => {
                  const duration = calculateDuration(transaction.entry_time, transaction.exit_time);
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
                        <span className="slot-badge">
                          🅿️ {transaction.parking_slot}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="time-info">
                          <span className="time-icon">🕐</span>
                          <div className="time-details">
                            <div className="time-value">
                              {new Date(transaction.entry_time).toLocaleTimeString()}
                            </div>
                            <div className="date-value">
                              {new Date(transaction.entry_time).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="time-info exited">
                          <span className="time-icon">🚪</span>
                          <div className="time-details">
                            <div className="time-value">
                              {new Date(transaction.exit_time).toLocaleTimeString()}
                            </div>
                            <div className="date-value">
                              {new Date(transaction.exit_time).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="duration-info">
                          <span className="duration-value">{duration}</span>
                          <span className="duration-label">parked</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="revenue-info">
                          <span className="revenue-amount">₱{revenue}</span>
                          <span className="revenue-label">earned</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => printIndividualReceipt(transaction)}
                            className="print-btn"
                            title="Print Receipt"
                          >
                            🧾
                          </button>
                          {deleteConfirm === transaction.id ? (
                            <div className="delete-confirm">
                              <span className="confirm-text">Delete?</span>
                              <button
                                onClick={() => handleDeleteLocal(transaction.id)}
                                disabled={deletingId === transaction.id}
                                className="confirm-btn confirm-yes"
                              >
                                {deletingId === transaction.id ? "..." : "Yes"}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="confirm-btn confirm-no"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(transaction.id)}
                              disabled={deletingId === transaction.id}
                              className="delete-btn"
                              title="Delete transaction"
                            >
                              {deletingId === transaction.id ? "..." : "🗑️"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Footer */}
        {sortedHistory.length > 0 && (
          <div className="summary-footer">
            <div className="summary-item">
              <span className="summary-label">Showing:</span>
              <span className="summary-value">{sortedHistory.length} transactions</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Filtered Revenue:</span>
              <span className="summary-value">
                ₱{sortedHistory.reduce((total, transaction) => 
                  total + calculateRevenue(transaction.entry_time, transaction.exit_time), 0)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Updated:</span>
              <span className="summary-value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .history-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          overflow-x: auto;
        }

        /* Parking Background */
        .parking-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.3;
        }

        .parking-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
        }

        .parking-space {
          position: relative;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .parking-line {
          width: 80%;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .moving-car, .parked-car, .floating-icon {
          position: absolute;
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          opacity: 0.6;
        }

        .car-1 { top: 20%; animation: moveCarRight 30s infinite; }
        .car-2 { top: 60%; animation: moveCarLeft 25s infinite 5s; }
        .car-3 { top: 80%; animation: moveCarRight 35s infinite 10s; }
        .parked-1 { bottom: 25%; left: 10%; animation: parkedBounce 4s infinite; }
        .parked-2 { top: 30%; right: 15%; animation: parkedBounce 3s infinite 1s; }
        .icon-1 { top: 15%; left: 20%; animation: float 8s infinite; }
        .icon-2 { top: 70%; left: 80%; animation: float 6s infinite 2s; }
        .icon-3 { top: 40%; left: 60%; animation: float 10s infinite 4s; }

        @keyframes moveCarRight {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }

        @keyframes moveCarLeft {
          0% { transform: translateX(calc(100vw + 100px)) scaleX(-1); }
          100% { transform: translateX(-100px) scaleX(-1); }
        }

        @keyframes parkedBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        .history-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Error Banner */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          margin-left: auto;
          font-size: 1.1rem;
          padding: 4px;
        }

        .error-close:hover {
          background: #fecaca;
          border-radius: 4px;
        }

        .history-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          text-align: center;
          margin-bottom: 30px;
        }

        .history-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .title-icon {
          font-size: 3rem;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          padding: 12px;
          border-radius: 16px;
          color: white;
        }

        .history-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          margin: 0;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          border-left: 4px solid;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.total {
          border-left-color: #4f46e5;
        }

        .stat-card.revenue {
          border-left-color: #10b981;
        }

        .stat-card.average {
          border-left-color: #f59e0b;
        }

        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .stat-info {
          flex: 1;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .controls-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 300px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-icon {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 1rem;
          color: #374151;
          flex: 1;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .sort-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .sort-select {
          background: white;
          border: 2px solid #e5e7eb;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }

        .sort-select:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .sort-order-btn {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sort-order-btn:hover {
          background: #e5e7eb;
        }

        /* Export Dropdown Styles */
        .export-dropdown {
          position: relative;
          display: inline-block;
        }

        .export-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          min-width: 120px;
          justify-content: center;
        }

        .export-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          margin-left: 4px;
          transition: transform 0.3s ease;
        }

        .export-dropdown.open .dropdown-arrow {
          transform: rotate(180deg);
        }

        .export-options {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          padding: 8px;
          min-width: 200px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid #e5e7eb;
        }

        .export-option {
          background: transparent;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .export-option:hover {
          background: #f3f4f6;
          color: #10b981;
        }

        .export-option.close-option {
          border-top: 1px solid #e5e7eb;
          margin-top: 4px;
          padding-top: 12px;
          color: #6b7280;
        }

        .export-option.close-option:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .export-option-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .table-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

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

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          border-bottom: 1px solid #e5e7eb;
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
          background: #d1fae5;
          color: #065f46;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .time-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .time-info.exited {
          color: #6b7280;
        }

        .time-icon {
          font-size: 0.875rem;
          margin-top: 2px;
        }

        .time-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .time-value {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .date-value {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .duration-info, .revenue-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .duration-value, .revenue-amount {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .duration-label, .revenue-label {
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .revenue-amount {
          color: #10b981;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .print-btn {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .print-btn:hover {
          background: #0369a1;
          color: white;
          transform: scale(1.1);
        }

        .delete-btn {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .delete-btn:hover:not(:disabled) {
          background: #dc2626;
          color: white;
          transform: scale(1.1);
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-confirm {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .confirm-text {
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 600;
          white-space: nowrap;
        }

        .confirm-btn {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .confirm-yes {
          background: #dc2626;
          color: white;
        }

        .confirm-yes:hover {
          background: #b91c1c;
        }

        .confirm-no {
          background: #6b7280;
          color: white;
        }

        .confirm-no:hover {
          background: #4b5563;
        }

        .summary-footer {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
          gap: 16px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
        }

        .summary-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 700;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .history-table {
            display: block;
            overflow-x: auto;
          }
          
          .table-header, .table-cell {
            white-space: nowrap;
          }
        }

        @media (max-width: 768px) {
          .history-container {
            padding: 10px;
          }
          
          .history-title {
            font-size: 2rem;
            flex-direction: column;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .sort-controls {
            justify-content: space-between;
          }
          
          .export-options {
            right: auto;
            left: 0;
          }
          
          .summary-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .delete-confirm {
            flex-direction: column;
            gap: 4px;
          }

          .confirm-text {
            font-size: 0.7rem;
          }

          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}