import { verifyAdmin, checkAdminSession, setAdminSession, clearAdminSession } from './utils/admin-auth';
import { useState, useEffect } from 'react';
import { AES, enc } from 'crypto-js';
import './BaggageReceipt.css';
import BackupManager from './components/BackupManager';
import { createBackup } from './utils/backup-system';

const BaggageReceiptForm = () => {
	const [showBackupManager, setShowBackupManager] = useState(false);
  const [formData, setFormData] = useState({
    passengerName: '',
    phoneNumber: '',
    address: '',
    flightDate: '',
    flightNumber: '',
    flightRoute: '',
    itemsWeight: '',
    fileNumber: '',
    bagColor: '',
    bagType: '',
    bagTag: '',
    signature: '',
    receivingDateTime: '',
    nasAgent: '',
    staffNumber: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [allReceipts, setAllReceipts] = useState([]);
  const [errors, setErrors] = useState({});

  // Encryption functions
  const encryptData = (data) => {
    return AES.encrypt(JSON.stringify(data), 'secure-key-12345').toString();
  };

  const decryptData = (data) => {
    try {
      const bytes = AES.decrypt(data, 'secure-key-12345');
      return JSON.parse(bytes.toString(enc.Utf8)) || [];
    } catch {
      return [];
    }
  };

  // DevTools protection (unchanged)
  useEffect(() => {
    const handleDevTools = (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const checkDevTools = setInterval(() => {
      if (window.outerWidth - window.innerWidth > 100 || 
          window.outerHeight - window.innerHeight > 100) {
        window.location.reload();
      }
    }, 1000);

    document.addEventListener('keydown', handleDevTools);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      clearInterval(checkDevTools);
      document.removeEventListener('keydown', handleDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const savedData = localStorage.getItem('baggageReceipts');
    if (savedData) {
      try {
        const decrypted = decryptData(savedData);
        setAllReceipts(decrypted);
      } catch {
        setAllReceipts([]);
      }
    }
  }, []);

  // Original functions (unchanged)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    const found = allReceipts.find(item => 
      item.bagTag.toLowerCase() === searchInput.toLowerCase().trim()
    );

    if (found) {
      setFormData(found);
      setIsEditing(true);
    } else {
      alert('No baggage found with this tag');
      setFormData({
        passengerName: '',
        phoneNumber: '',
        address: '',
        flightDate: '',
        flightNumber: '',
        flightRoute: '',
        itemsWeight: '',
        fileNumber: '',
        bagColor: '',
        bagType: '',
        bagTag: '',
        signature: '',
        receivingDateTime: '',
        nasAgent: '',
        staffNumber: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Required';
    if (!formData.fileNumber) newErrors.fileNumber = 'Required';
    if (!formData.bagTag) newErrors.bagTag = 'Required';
    if (!formData.receivingDateTime) newErrors.receivingDateTime = 'Required';
    if (!formData.nasAgent) newErrors.nasAgent = 'Required';
    if (!formData.staffNumber) newErrors.staffNumber = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const updatedReceipts = isEditing 
      ? allReceipts.map(item => 
          item.bagTag === formData.bagTag ? formData : item
        )
      : [...allReceipts, formData];

    localStorage.setItem('baggageReceipts', encryptData(updatedReceipts));
setAllReceipts(updatedReceipts);

// 🟢 النسخ الاحتياطي هنا:
createBackup(updatedReceipts);

window.print();

  };

  // UI remains exactly the same
  return (
    <div className="container">
      {/* Search Section */}
      <div className="search-bar">
        <div className="search-group">
          <input 
            type="text" 
            placeholder="Enter Bag Tag Number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            type="button" 
            className="search-btn"
            onClick={handleSearch}
          >
            🔍 Search
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form className="main-form" onSubmit={handleSubmit}>
        <div className="form-header">
         <img src="/airline-logo.jpg" alt="Airline Logo" style={{ height: "60px" }} />

          <h2> Baggage Receipt </h2>
        </div>

        <div className="form-body">
          {/* Passenger Information */}
          <div className="form-section">
            <h3 className="section-title">Passenger Details</h3>
            <div className="section-content">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="passengerName"
                  value={formData.passengerName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={`input-group ${errors.phoneNumber ? 'has-error' : ''}`}>
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
                {errors.phoneNumber && <span className="error-msg">{errors.phoneNumber}</span>}
              </div>

              <div className="input-group">
                <label>Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="form-section">
            <h3 className="section-title">Flight Information</h3>
            <div className="section-content">
              <div className="input-group">
                <label>Flight Date</label>
                <input
                  type="date"
                  name="flightDate"
                  value={formData.flightDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="input-group">
                <label>Flight Number</label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>Route</label>
                <input
                  type="text"
                  name="flightRoute"
                  value={formData.flightRoute}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Baggage Details */}
          <div className="form-section">
            <h3 className="section-title">Baggage Information</h3>
            <div className="section-content">
              <div className="input-group">
                <label>Total Weight (kg)</label>
                <input
                  type="number"
                  name="itemsWeight"
                  value={formData.itemsWeight}
                  onChange={handleInputChange}
                />
              </div>

              <div className={`input-group ${errors.fileNumber ? 'has-error' : ''}`}>
                <label>File Reference *</label>
                <input
                  type="text"
                  name="fileNumber"
                  value={formData.fileNumber}
                  onChange={handleInputChange}
                />
                {errors.fileNumber && <span className="error-msg">{errors.fileNumber}</span>}
              </div>

              <div className="baggage-table">
                <table>
                  <thead>
                    <tr>
                      <th>Bag Color</th>
                      <th>Bag Type</th>
                      <th>Bag Tag *</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <input
                          type="text"
                          name="bagColor"
                          value={formData.bagColor}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="bagType"
                          value={formData.bagType}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <div className={`input-group ${errors.bagTag ? 'has-error' : ''}`}>
                          <input
                            type="text"
                            name="bagTag"
                            value={formData.bagTag}
                            onChange={handleInputChange}
                          />
                          {errors.bagTag && <span className="error-msg">{errors.bagTag}</span>}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="form-section">
            <h3 className="section-title">Verification</h3>
            <div className="section-content">
              <div className={`input-group ${errors.receivingDateTime ? 'has-error' : ''}`}>
                <label>Receipt Date/Time *</label>
                <input
                  type="datetime-local"
                  name="receivingDateTime"
                  value={formData.receivingDateTime}
                  onChange={handleInputChange}
                />
                {errors.receivingDateTime && <span className="error-msg">{errors.receivingDateTime}</span>}
              </div>

              <div className={`input-group ${errors.nasAgent ? 'has-error' : ''}`}>
                <label>NAS Agent *</label>
                <input
                  type="text"
                  name="nasAgent"
                  value={formData.nasAgent}
                  onChange={handleInputChange}
                />
                {errors.nasAgent && <span className="error-msg">{errors.nasAgent}</span>}
              </div>

              <div className={`input-group ${errors.staffNumber ? 'has-error' : ''}`}>
                <label>Staff ID *</label>
                <input
                  type="text"
                  name="staffNumber"
                  value={formData.staffNumber}
                  onChange={handleInputChange}
                />
                {errors.staffNumber && <span className="error-msg">{errors.staffNumber}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button type="reset" className="secondary-btn">
              Clear Form
            </button>
            <button type="submit" className="primary-btn">
              {isEditing ? 'Update' : 'Save'} & Print
            </button>
          </div>
        </div>
      </form>
      <div className="license-footer">
        Printed from Fadhil Ahmed's Official System © 2025 — All Rights Reserved
      </div>

      <div className="footer-credits">
        <p>
          Copyright © Fadhil Ahmed 2025. All rights reserved. <br />
          Baggage Receipt System BGW — Version 1.0
        </p>
      </div>
	  {/* زر إدارة النسخ الاحتياطية والمودال */}
{checkAdminSession() ? (
  <button 
    onClick={() => setShowBackupManager(true)} 
    className="admin-btn"
  >
    إدارة النسخ الاحتياطية
  </button>
) : (
  <button 
    onClick={() => {
      const pass = prompt("🔐 أدخل كلمة المرور للدخول إلى الإدارة:");
      if (verifyAdmin(pass)) {
        setAdminSession(true);
        setShowBackupManager(true);
      } else {
        alert("❌ كلمة المرور غير صحيحة!");
      }
    }}
    className="admin-btn"
  >
    🔐 تسجيل دخول كمسؤول
  </button>
)}

{showBackupManager && (
  <div className="backup-modal">
    <div className="modal-content">
      <BackupManager onClose={() => setShowBackupManager(false)} />
    </div>
  </div>
)}
{showBackupManager && (
  <div className="backup-modal">
    <div className="modal-content">
      <BackupManager onClose={() => setShowBackupManager(false)} />
    </div>
  </div>
)}

{/* ✅ زر تسجيل خروج المسؤول */}
{checkAdminSession() ? (
  <>
    <button 
      onClick={() => setShowBackupManager(true)} 
      className="admin-btn"
    >
      🛠️ إدارة النسخ الاحتياطية
    </button>

    <button 
      onClick={() => {
        clearAdminSession();
        setShowBackupManager(false);
        alert("✅ تم تسجيل الخروج بنجاح!");
      }}
      className="logout-btn"
    >
	<button className="logout-btn no-print">...</button>

      🚪 تسجيل الخروج
    </button>
  </>
) : (
  <button 
    onClick={() => {
      const pass = prompt("🔐 أدخل كلمة المرور للدخول إلى الإدارة:");
      if (verifyAdmin(pass)) {
        setAdminSession(true);
        setShowBackupManager(true);
      } else {
        alert("❌ كلمة المرور غير صحيحة!");
      }
    }}
    className="admin-btn"
  >
    🔐 تسجيل دخول كمسؤول
  </button>
)}


    </div>
  );
};

export default BaggageReceiptForm;