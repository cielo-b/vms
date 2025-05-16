import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import {
  fetchExitRequests,
  updateExitRequest,
} from "../../features/admin/admin.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const AdminExitRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { exitRequests, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchExitRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await dispatch(updateExitRequest({ id, status })).unwrap();
      toast.success(`Exit request ${status} successfully!`);
    } catch (err) {
      toast.error(`Failed to ${status} exit request`);
    }
  };

  const handleExport = () => {
    exportToExcel(exitRequests, "exit_requests");
  };

  return (
    <DashboardLayout>
  <div className="space-y-6 p-4">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Exit Requests</h1>
      <button
        onClick={handleExport}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Export to Excel
      </button>
    </div>

    {loading ? (
      <div className="flex justify-center items-center p-8">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Vehicle", "Parking", "Created At", "Status", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exitRequests.map((request: any) => (
              <tr key={request.id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.customer?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {request.vehicle?.licensePlate || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {request.parking?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {moment(request.createdAt).format("YYYY-MM-DD HH:mm")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                    ${
                      request.status === "approved" 
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === "pending" && (
                    <div className="space-x-3">
                      <button
                        onClick={() => handleStatusChange(request.id, "approved")}
                        className="text-green-600 hover:text-green-900 hover:bg-green-50 px-3 py-1 rounded-md transition duration-150"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(request.id, "rejected")}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-md transition duration-150"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</DashboardLayout>
  );
};

export default AdminExitRequestsPage;
