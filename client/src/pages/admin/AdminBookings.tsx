import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import {
  fetchBookings,
  updateBookingStatus,
} from "../../features/admin/admin.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const AdminBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStatusChange = async (
    id: string,
    status: "confirmed" | "rejected"
  ) => {
    try {
      await dispatch(updateBookingStatus({ id, status })).unwrap();
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(`Failed to ${status} booking`);
    }
  };

  const handleExport = () => {
    exportToExcel(bookings, "all_bookings");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">All Bookings</h1>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Customer",
                    "Parking",
                    "Spot",
                    "Start Time",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.parkingSpot?.parkingLot?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.parkingSpot?.spotNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moment(booking.startTime).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-900 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "rejected")
                            }
                            className="text-red-600 hover:text-red-900 hover:underline"
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

export default AdminBookingsPage;
