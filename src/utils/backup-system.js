export const createBackup = (data) => {
  const timestamp = new Date().toISOString();
  const backupKey = `backup_${timestamp}`;

  const backupData = {
    data,
    timestamp,
    hash: generateSimpleHash(JSON.stringify(data))
  };

  localStorage.setItem(backupKey, JSON.stringify(backupData));
  return backupKey;
};

export const getAllBackups = () => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('backup_'))
    .map(key => ({
      key,
      ...JSON.parse(localStorage.getItem(key))
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const generateSimpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};
