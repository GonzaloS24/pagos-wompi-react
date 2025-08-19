import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/auth/UseAuth";

const PrivateRoute = () => {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/admin-login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
