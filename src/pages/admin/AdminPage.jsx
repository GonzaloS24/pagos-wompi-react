import useAuth from "../../context/auth/UseAuth";

const AdminPage = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h1>Dashboard de Administración</h1>
      <p>¡Bienvenido al panel de administración!</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default AdminPage;
