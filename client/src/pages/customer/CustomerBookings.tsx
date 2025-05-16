import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchBookings,
  cancelBooking,
} from "../../features/customer/customer.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import moment from "moment";
import DashboardLayout from "../../layouts/DashboardLayout";

const CustomerBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector(
    (state) => state.customer
  );

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking(id)).unwrap();
        toast.success("Booking cancelled successfully!");
      } catch (err) {
        toast.error("Failed to cancel booking");
      }
    }
  };

  const handleExport = () => {
    exportToExcel(bookings, "my_bookings");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Bookings</h1>
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
                    Parking
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Spot
                  </th>
                  <th className="px-6 py-3 text-left text-sm fontloops-medium text-gray-500">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    End Time
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
                {bookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4">
                      {booking.parkingSpot?.parkingLot?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {booking.parkingSpot?.spotNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {moment(booking.startTime).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {booking.endTime
                        ? moment(booking.endTime).format("YYYY-MM-DD HH:mm")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">{booking.status}</td>
                    <td className="px-6 py-4">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
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

export default CustomerBookingsPage;
