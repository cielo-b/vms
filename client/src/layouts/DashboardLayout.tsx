import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }: { children: any }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (window.location.pathname === "/dashboard" && user) {
      navigate(
        (user as any).role === "ADMIN"
          ? "/dashboard/admin/parking"
          : "/dashboard/customer/parking"
      );
    }
  }, [user, navigate]);
  console.log((user as any).role);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer position="top-center" autoClose={3000} />
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        role={(user as any).role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="mx-auto px-4 py-2 max-w-7xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
