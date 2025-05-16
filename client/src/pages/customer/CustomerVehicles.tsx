import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchVehicles,
  updateVehicle,
  createVehicle,
  deleteVehicle,
} from "../../features/customer/customer.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, "License plate is required"),
});

type VehicleData = z.infer<typeof vehicleSchema>;

const CustomerVehiclesPage = () => {
const dispatch = useAppDispatch();
const { vehicles, loading, error } = useAppSelector(
    (state) => state.customer
);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
} = useForm<VehicleData>({ resolver: zodResolver(vehicleSchema) });

useEffect(() => {
    dispatch(fetchVehicles());
}, [dispatch]);

useEffect(() => {
    if (error) toast.error(error);
}, [error]);
const handleSubmitVehicle = async (data: VehicleData) => {
    try {
        if (editingVehicle) {
            await dispatch(
                updateVehicle({
                    id: editingVehicle.id,
                    data: {
                        plateNumber: data.plateNumber,
                    },
                })
            ).unwrap();
            await dispatch(fetchVehicles()); // Fetch latest vehicles after update
            toast.success("Vehicle updated successfully!");
        } else {
            await dispatch(
                createVehicle({ plateNumber: data.plateNumber })
            ).unwrap();
            toast.success("Vehicle created successfully!");
        }
        setIsModalOpen(false);
        setEditingVehicle(null);
        reset();
    } catch (err) {
        toast.error("Failed to save vehicle");
    }
};
const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setValue("plateNumber", vehicle.plateNumber);
    setIsModalOpen(true);
};

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await dispatch(deleteVehicle(id)).unwrap();
        toast.success("Vehicle deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleExport = () => {
    exportToExcel(vehicles, "my_vehicles");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Vehicles</h1>
          <div className="space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Vehicle
            </button>
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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4">
                      {JSON.parse(localStorage.getItem("user") || "{}").name}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
              </h2>
              <form
                onSubmit={handleSubmit(handleSubmitVehicle)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-gray-700 mb-1">
                    License Plate
                  </label>
                  <input
                    {...register("plateNumber")}
                    className="w-full p-2 border rounded"
                    placeholder="ABC123"
                  />
                  {errors.plateNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.plateNumber.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingVehicle(null);
                      reset();
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerVehiclesPage;
