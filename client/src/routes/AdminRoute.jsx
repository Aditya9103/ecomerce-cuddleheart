import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (userInfo && userInfo.role === 'admin') {
    return children;
  }
  
  return <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
