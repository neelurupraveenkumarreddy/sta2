import { Navigate } from "react-router-dom";
import Cookies from 'js-cookie'
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Cookies.get("jwt_token"); // Replace with your auth check

  return isAuthenticated ? children : <Navigate to="/notaccessable" />;
};

export default ProtectedRoute;
