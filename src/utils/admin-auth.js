const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

export const verifyAdmin = (password) => {
  return password === ADMIN_PASSWORD;
};

export const setAdminSession = (isAdmin) => {
  sessionStorage.setItem('isAdmin', isAdmin.toString());
};

export const checkAdminSession = () => {
  return sessionStorage.getItem('isAdmin') === 'true';
};

export const clearAdminSession = () => {
  sessionStorage.removeItem('isAdmin');
};
