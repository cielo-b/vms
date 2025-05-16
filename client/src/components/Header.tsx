import { useAppDispatch } from "../hooks/hooks";
import { logout } from "../features/auth/auth.slice";
import type { User } from "../types/auth";

interface HeaderProps {
  toggleSidebar: () => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, user }) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center">
        <button
          className="md:hidden mr-4 text-gray-600"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <h1 className="text-xl font-semibold">Parking Management</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">
          Welcome, {JSON.parse(localStorage.getItem("user") || "{}").name}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
