import { useState, useEffect } from 'react';
import { getAllBackups } from '../utils/backup-system';

const BackupManager = ({ onClose }) => {
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    setBackups(getAllBackups());
  }, []);

  const handleRestore = (backup) => {
    localStorage.setItem('baggageReceipts', JSON.stringify(backup.data));
    alert('تم استعادة النسخة بنجاح!');
    onClose();
    window.location.reload();
  };

  const handleDelete = (key) => {
    if (window.confirm('هل أنت متأكد من حذف هذه النسخة؟')) {
      localStorage.removeItem(key);
      setBackups(getAllBackups());
    }
  };

  const handleExport = (backup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${backup.timestamp}.json`;
    a.click();
  };

  return (
    <div>
      <h2>إدارة النسخ الاحتياطية</h2>
      <button onClick={onClose} style={{ marginBottom: '10px' }}>❌ إغلاق</button>
      <div className="backup-list">
        {backups.length === 0 ? (
          <p>لا توجد نسخ احتياطية بعد.</p>
        ) : (
          backups.map((backup, index) => (
            <div className="backup-item" key={index}>
              <div>
                <strong>{backup.timestamp}</strong> - Hash: {backup.hash}
              </div>
              <div className="backup-actions">
                <button onClick={() => handleRestore(backup)}>استعادة</button>
                <button onClick={() => handleExport(backup)}>تصدير</button>
                <button onClick={() => handleDelete(backup.key)}>🗑 حذف</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BackupManager;
