import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import { fetchVehicles } from "../../features/admin/admin.slice";
import DashboardLayout from "../../layouts/DashboardLayout";

const AdminVehiclesPage = () => {
  const dispatch = useAppDispatch();
  const { vehicles, loading, error } = useAppSelector((state) => state.admin);
  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleExport = () => {
    exportToExcel(vehicles, "all_vehicles");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Vehicles</h1>
          <div className="space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    License Plate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4">
                      {vehicle.owner?.email || "N/A"}
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

export default AdminVehiclesPage;
