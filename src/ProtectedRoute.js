import { Navigate } from "react-router-dom";

const isLoggedIn = () => {
  return localStorage.getItem("loging") === "true";
};

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;