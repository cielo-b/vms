import { NavLink } from "react-router-dom";
import { ERole } from "../enums/ERole";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  role: ERole;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, role }) => {
  const customerLinks = [
    { to: "/dashboard/customer/parking", label: "Parkings", icon: "🏬" },
    { to: "/dashboard/customer/vehicles", label: "My Vehicles", icon: "🚗" },
    { to: "/dashboard/customer/bookings", label: "My Bookings", icon: "📅" },
    { to: "/dashboard/customer/receipts", label: "Receipts", icon: "🧾" },
  ];

  const adminLinks = [
    { to: "/dashboard/admin/parking", label: "Parkings", icon: "🏬" },
    { to: "/dashboard/admin/vehicles", label: "Vehicles", icon: "🚗" },
    { to: "/dashboard/admin/bookings", label: "Bookings", icon: "📅" },
    { to: "/dashboard/admin/parking-requests", label: "Parking Requests", icon: "🚪" },
    { to: "/dashboard/admin/exit-requests", label: "Exit Requests", icon: "🚶" },
    { to: "/dashboard/admin/receipts", label: "Receipts", icon: "🧾" },
  ];

  const links = role === ERole.ADMIN ? adminLinks : customerLinks;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">{role === ERole.ADMIN ? "Admin Dashboard" : "Customer Dashboard"}</h2>
        <button className="md:hidden mt-2 text-gray-300" onClick={toggleSidebar}>
          ✕
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
                }
                onClick={() => isOpen && toggleSidebar()}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;