import { useState, useEffect } from "react";
import { addTransaction, getOccupiedSlots } from "./services/api";

export default function TransactionForm({ onAdded }) {
  const [form, setForm] = useState({
    owner_name: "",
    vehicle_name: "",
    vehicle_type: "",
    plate_number: "",
    entry_time: "",
    parking_slot: "",
  });

  const [errors, setErrors] = useState({});
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const data = await getOccupiedSlots();
        setOccupiedSlots(data);
      } catch (err) {
        console.error("Failed to load occupied slots:", err);
      }
    }
    fetchSlots();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  }

  function validate() {
    const newErrors = {};

    if (!form.owner_name.trim()) {
      newErrors.owner_name = "Owner name is required.";
    }
    if (!form.vehicle_name.trim()) {
      newErrors.vehicle_name = "Vehicle name is required.";
    }
    if (!form.vehicle_type) {
      newErrors.vehicle_type = "Vehicle type is required.";
    }
    const platePattern = /^[A-Z]{3}\d{3}$/;
    if (!platePattern.test(form.plate_number.toUpperCase())) {
      newErrors.plate_number = "Plate number must be like ABC123.";
    }
    if (!form.entry_time) {
      newErrors.entry_time = "Entry time is required.";
    }
    if (!form.parking_slot) {
      newErrors.parking_slot = "Parking slot is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addTransaction(form);
      setForm({
        owner_name: "",
        vehicle_name: "",
        vehicle_type: "",
        plate_number: "",
        entry_time: "",
        parking_slot: "",
      });
      setErrors({});
      setShowSuccess(true);
      
      if (onAdded) onAdded();

      const updatedSlots = await getOccupiedSlots();
      setOccupiedSlots(updatedSlots);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Error: " + (err.response?.data?.error || "Failed to add transaction."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const allSlots = [
    "A1","A2","A3","A4","A5",
    "B1","B2","B3","B4","B5",
    "C1","C2","C3","C4","C5",
    "D1","D2","D3","D4","D5",
    "E1","E2","E3","E4","E5",
  ];

  const vehicleIcons = {
    motorcycle: "🏍️",
    car: "🚗",
    bike: "🚴",
    "e-bike": "🛴",
    truck: "🚚"
  };

  return (
    <div className="form-container">
      {/* Animated Background */}
      <div className="parking-background">
        {/* Parking Grid */}
        <div className="parking-grid">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="parking-space">
              <div className="parking-line"></div>
            </div>
          ))}
        </div>
        
        {/* Moving Cars */}
        <div className="moving-car car-1">🚗</div>
        <div className="moving-car car-2">🚙</div>
        <div className="moving-car car-3">🏎️</div>
        <div className="moving-car car-4">🚐</div>
        <div className="moving-car car-5">🚗</div>
        
        {/* Parking Cars */}
        <div className="parked-car parked-1">🚘</div>
        <div className="parked-car parked-2">🚙</div>
        <div className="parked-car parked-3">🚗</div>
        <div className="parked-car parked-4">🏎️</div>
        
        {/* Traffic Cones */}
        <div className="traffic-cone cone-1">🔺</div>
        <div className="traffic-cone cone-2">🔺</div>
        <div className="traffic-cone cone-3">🔺</div>
        
        {/* Floating Bubbles */}
        <div className="bubble bubble-1">🅿️</div>
        <div className="bubble bubble-2">🚗</div>
        <div className="bubble bubble-3">🅿️</div>
        <div className="bubble bubble-4">🚙</div>
        <div className="bubble bubble-5">🏎️</div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="success-notification">
          <div className="success-content">
            <span className="success-icon">✅</span>
            <div>
              <h3>Transaction Successful!</h3>
              <p>Vehicle has been registered and parked.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="parking-form">
        {/* Header */}
        <div className="form-header">
          <div className="header-accent"></div>
          <div className="header-decoration-1"></div>
          <div className="header-decoration-2"></div>
          
          <div className="header-content">
            <h2 className="form-title">
              <span className="form-icon">🅿️</span>
              <span className="title-text">
                Add Parking Transaction
              </span>
            </h2>
            <p className="form-subtitle">Fill in the details to register a new vehicle</p>
          </div>
        </div>

        <div className="form-body">
          {/* Owner Name */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👤</span>
              Owner Name
            </label>
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                onFocus={() => setFocusedField("owner_name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter owner's full name"
                className={`form-input ${focusedField === "owner_name" ? "input-focused" : ""} ${
                  errors.owner_name ? "input-error" : ""
                }`}
                required
              />
            </div>
            {errors.owner_name && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.owner_name}
              </p>
            )}
          </div>

          {/* Vehicle Name */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🚘</span>
              Vehicle Name
            </label>
            <div className="input-container">
              <span className="input-icon">🚘</span>
              <input
                name="vehicle_name"
                value={form.vehicle_name}
                onChange={handleChange}
                onFocus={() => setFocusedField("vehicle_name")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., Toyota Camry, Honda CB500"
                className={`form-input ${focusedField === "vehicle_name" ? "input-focused" : ""} ${
                  errors.vehicle_name ? "input-error" : ""
                }`}
                required
              />
            </div>
            {errors.vehicle_name && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.vehicle_name}
              </p>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🚗</span>
              Vehicle Type
            </label>
            <div className="input-container">
              <span className="input-icon">
                {form.vehicle_type ? vehicleIcons[form.vehicle_type] : "🚗"}
              </span>
              <select
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                onFocus={() => setFocusedField("vehicle_type")}
                onBlur={() => setFocusedField(null)}
                className={`form-input form-select ${focusedField === "vehicle_type" ? "input-focused" : ""} ${
                  errors.vehicle_type ? "input-error" : ""
                }`}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="motorcycle">🏍️ Motorcycle</option>
                <option value="car">🚗 Car</option>
                <option value="bike">🚴 Bike</option>
                <option value="e-bike">🛴 E-Bike</option>
                <option value="truck">🚚 Truck</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
            {errors.vehicle_type && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.vehicle_type}
              </p>
            )}
          </div>

          {/* Plate Number */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🔢</span>
              Plate Number
            </label>
            <div className="input-container">
              <span className="input-icon">🔢</span>
              <input
                name="plate_number"
                value={form.plate_number}
                onChange={handleChange}
                onFocus={() => setFocusedField("plate_number")}
                onBlur={() => setFocusedField(null)}
                placeholder="ABC123"
                className={`form-input plate-input ${focusedField === "plate_number" ? "input-focused" : ""} ${
                  errors.plate_number ? "input-error" : ""
                }`}
                maxLength={6}
                required
              />
            </div>
            {errors.plate_number && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.plate_number}
              </p>
            )}
          </div>

          {/* Entry Time */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🕐</span>
              Entry Time
            </label>
            <div className="input-container">
              <span className="input-icon">🕐</span>
              <input
                type="datetime-local"
                name="entry_time"
                value={form.entry_time}
                onChange={handleChange}
                onFocus={() => setFocusedField("entry_time")}
                onBlur={() => setFocusedField(null)}
                className={`form-input ${focusedField === "entry_time" ? "input-focused" : ""} ${
                  errors.entry_time ? "input-error" : ""
                }`}
                required
              />
            </div>
            {errors.entry_time && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.entry_time}
              </p>
            )}
          </div>

          {/* Parking Slot */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📍</span>
              Parking Slot
            </label>
            <div className="input-container">
              <span className="input-icon">📍</span>
              <select
                name="parking_slot"
                value={form.parking_slot}
                onChange={handleChange}
                onFocus={() => setFocusedField("parking_slot")}
                onBlur={() => setFocusedField(null)}
                className={`form-input form-select ${focusedField === "parking_slot" ? "input-focused" : ""} ${
                  errors.parking_slot ? "input-error" : ""
                }`}
                required
              >
                <option value="">Select Parking Slot</option>
                {allSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={occupiedSlots.includes(slot)}
                    className={occupiedSlots.includes(slot) ? "option-taken" : "option-available"}
                  >
                    {slot} {occupiedSlots.includes(slot) ? "🔴 (Taken)" : "🟢 (Available)"}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            {errors.parking_slot && (
              <p className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.parking_slot}
              </p>
            )}
            <div className="slot-info">
              <p className="slot-count">
                {occupiedSlots.length} of {allSlots.length} slots occupied
              </p>
              <div className="slot-legend">
                <span className="legend-item available">
                  <span className="legend-dot"></span>
                  Available
                </span>
                <span className="legend-item taken">
                  <span className="legend-dot"></span>
                  Taken
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-button ${isSubmitting ? "submitting" : ""}`}
            >
              <div className="button-overlay"></div>
              {isSubmitting ? (
                <span className="button-content">
                  <span className="button-spinner">⏳</span>
                  Processing Transaction...
                </span>
              ) : (
                <span className="button-content">
                  <span className="button-icon">✅</span>
                  Add Parking Transaction
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }

        /* Parking Background Animation */
        .parking-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .parking-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
          opacity: 0.1;
        }

        .parking-space {
          position: relative;
          border: 1px dashed rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .parking-line {
          width: 80%;
          height: 4px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
        }

        /* Moving Cars */
        .moving-car {
          position: absolute;
          font-size: 2rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .car-1 {
          top: 15%;
          animation: moveCarRight 25s infinite;
          font-size: 2.5rem;
        }

        .car-2 {
          top: 35%;
          animation: moveCarLeft 30s infinite 5s;
          font-size: 2.2rem;
        }

        .car-3 {
          top: 55%;
          animation: moveCarRight 20s infinite 10s;
          font-size: 2.8rem;
        }

        .car-4 {
          top: 75%;
          animation: moveCarLeft 35s infinite 15s;
          font-size: 2rem;
        }

        .car-5 {
          top: 85%;
          animation: moveCarRight 28s infinite 8s;
          font-size: 2.3rem;
        }

        /* Parked Cars */
        .parked-car {
          position: absolute;
          font-size: 1.8rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          opacity: 0.7;
        }

        .parked-1 { bottom: 20%; left: 10%; animation: parkedCarBounce 4s infinite; }
        .parked-2 { bottom: 30%; right: 15%; animation: parkedCarBounce 3s infinite 1s; }
        .parked-3 { top: 25%; left: 20%; animation: parkedCarBounce 5s infinite 2s; }
        .parked-4 { top: 45%; right: 25%; animation: parkedCarBounce 3.5s infinite 0.5s; }

        /* Traffic Cones */
        .traffic-cone {
          position: absolute;
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: coneBlink 2s infinite;
        }

        .cone-1 { bottom: 15%; left: 5%; }
        .cone-2 { top: 20%; right: 8%; animation-delay: 0.5s; }
        .cone-3 { top: 60%; left: 12%; animation-delay: 1s; }

        /* Floating Bubbles */
        .bubble {
          position: absolute;
          font-size: 1.2rem;
          opacity: 0.6;
          animation: floatBubble 15s infinite linear;
        }

        .bubble-1 { left: 10%; animation-delay: 0s; animation-duration: 20s; }
        .bubble-2 { left: 20%; animation-delay: 2s; animation-duration: 25s; }
        .bubble-3 { left: 30%; animation-delay: 4s; animation-duration: 18s; }
        .bubble-4 { left: 40%; animation-delay: 6s; animation-duration: 22s; }
        .bubble-5 { left: 50%; animation-delay: 8s; animation-duration: 30s; }

        /* Animations */
        @keyframes moveCarRight {
          0% {
            transform: translateX(-100px) scaleX(1);
          }
          49% {
            transform: translateX(calc(100vw + 100px)) scaleX(1);
          }
          50% {
            transform: translateX(calc(100vw + 100px)) scaleX(-1);
          }
          99% {
            transform: translateX(-100px) scaleX(-1);
          }
          100% {
            transform: translateX(-100px) scaleX(1);
          }
        }

        @keyframes moveCarLeft {
          0% {
            transform: translateX(calc(100vw + 100px)) scaleX(-1);
          }
          49% {
            transform: translateX(-100px) scaleX(-1);
          }
          50% {
            transform: translateX(-100px) scaleX(1);
          }
          99% {
            transform: translateX(calc(100vw + 100px)) scaleX(1);
          }
          100% {
            transform: translateX(calc(100vw + 100px)) scaleX(-1);
          }
        }

        @keyframes parkedCarBounce {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          50% {
            transform: translateY(-5px) rotate(2deg);
          }
        }

        @keyframes coneBlink {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes floatBubble {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        /* Success Notification */
        .success-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-left: 4px solid #10b981;
          z-index: 1000;
          animation: slideInRight 0.3s ease-out;
        }

        .success-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .success-icon {
          font-size: 24px;
          background: #10b981;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-content h3 {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
        }

        .success-content p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* Form Styles */
        .parking-form {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transform: translateY(0);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          z-index: 10;
        }

        .parking-form:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 35px 60px -12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .form-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .header-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }

        .header-decoration-1 {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .header-decoration-2 {
          position: absolute;
          bottom: -40px;
          left: -40px;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .header-content {
          position: relative;
          z-index: 10;
        }

        .form-title {
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .form-icon {
          font-size: 3rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .title-text {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-subtitle {
          color: #c7d2fe;
          font-size: 1.1rem;
          font-weight: 300;
          margin: 0;
        }

        .form-body {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-group {
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-icon {
          background: #e0e7ff;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.125rem;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .form-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          padding: 16px 16px 16px 48px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          background: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:hover {
          border-color: #93c5fd;
          background: #f8faff;
        }

        .input-focused {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
          transform: scale(1.02);
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .input-error {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
        }

        .form-select {
          appearance: none;
          cursor: pointer;
          padding-right: 48px;
        }

        .select-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .plate-input {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #1f2937;
        }

        .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          background: #fef2f2;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          animation: pulse 2s infinite;
        }

        .error-icon {
          color: #dc2626;
        }

        .option-taken {
          color: #ef4444;
          background: #fef2f2;
        }

        .option-available {
          color: #059669;
        }

        .slot-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding: 0 4px;
        }

        .slot-count {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          margin: 0;
        }

        .slot-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .available {
          color: #059669;
        }

        .taken {
          color: #dc2626;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .available .legend-dot {
          background: #10b981;
        }

        .taken .legend-dot {
          background: #ef4444;
        }

        .submit-section {
          padding-top: 24px;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          font-weight: 700;
          padding: 20px 32px;
          border-radius: 12px;
          border: none;
          font-size: 1.125rem;
          box-shadow: 
            0 20px 25px -5px rgba(79, 70, 229, 0.3),
            0 10px 10px -5px rgba(79, 70, 229, 0.1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          transform: translateY(0);
        }

        .submit-button:hover:not(.submitting) {
          transform: translateY(-2px);
          box-shadow: 
            0 25px 30px -5px rgba(79, 70, 229, 0.4),
            0 15px 15px -5px rgba(79, 70, 229, 0.2);
          background: linear-gradient(135deg, #4338ca, #6d28d9);
        }

        .submit-button:active:not(.submitting) {
          transform: translateY(0);
        }

        .submit-button.submitting {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .button-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .submit-button:hover .button-overlay:not(.submitting) {
          opacity: 1;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 10;
        }

        .button-icon {
          font-size: 1.25rem;
          transition: transform 0.3s ease;
        }

        .submit-button:hover .button-icon:not(.submitting) {
          transform: scale(1.1);
        }

        .button-spinner {
          font-size: 1.25rem;
          animation: spin 1s linear infinite;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .form-container {
            padding: 10px;
          }

          .form-header {
            padding: 30px 24px;
          }

          .form-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .form-body {
            padding: 30px 24px;
          }

          .slot-info {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .success-notification {
            right: 10px;
            left: 10px;
            top: 10px;
          }

          /* Reduce background animations on mobile */
          .moving-car {
            font-size: 1.5rem;
          }

          .parked-car {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}