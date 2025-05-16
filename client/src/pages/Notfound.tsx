import { Link } from "react-router-dom";
import { ERole } from "../enums/ERole";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        {JSON.parse(localStorage.getItem("user") || "{}") == null ? (
          <Link
            to={"/"}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go to Login
          </Link>
        ) : (
          <Link
            to={
              JSON.parse(localStorage.getItem("user") || "{}").role ==
              ERole.ADMIN
                ? "/dashboard/admin/parking"
                : "/dashboard/customer/parking"
            }
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
