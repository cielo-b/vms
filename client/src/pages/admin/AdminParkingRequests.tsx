import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import {
  fetchParkingRequests,
  updateParkingRequest,
} from "../../features/admin/admin.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const AdminParkingRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { parkingRequests, loading, error } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchParkingRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await dispatch(updateParkingRequest({ id, status })).unwrap();
      toast.success(`Parking request ${status} successfully!`);
    } catch (err) {
      toast.error(`Failed to ${status} parking request`);
    }
  };

  const handleExport = () => {
    exportToExcel(parkingRequests, "parking_requests");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parking Requests</h1>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Parking
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parkingRequests.map((request: any) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      {request.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {request.vehicle?.licensePlate || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {request.parking?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {moment(request.createdAt).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-6 py-4">{request.status}</td>
                    <td className="px-6 py-4 space-x-2">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(request.id, "approved")
                            }
                            className="text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(request.id, "rejected")
                            }
                            className="text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </>
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

export default AdminParkingRequestsPage;
