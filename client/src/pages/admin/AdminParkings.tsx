import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
  fetchParkings,
  updateParking,
  createParking,
  createParkingSpot,
  deleteParking,
} from "../../features/admin/admin.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const parkingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  pricePerHour: z.number().min(0, "Price per hour must be non-negative"),
});

const spotSchema = z.object({
  spotNumber: z.string().min(1, "Spot number is required"),
  status: z.enum(["available", "maintenance"]),
});

type ParkingData = z.infer<typeof parkingSchema>;
type SpotData = z.infer<typeof spotSchema>;

const AdminParkingPage = () => {
  const dispatch = useAppDispatch();
  const { parkings, loading, error } = useAppSelector((state) => state.admin);
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<any | null>(null);
  const [expandedParkingId, setExpandedParkingId] = useState<string | null>(
    null
  );
  const {
    register: registerParking,
    handleSubmit: handleParkingSubmit,
    formState: { errors: parkingErrors },
    reset: resetParking,
    setValue: setParkingValue,
  } = useForm<ParkingData>({ resolver: zodResolver(parkingSchema) });
  const {
    register: registerSpot,
    handleSubmit: handleSpotSubmit,
    formState: { errors: spotErrors },
    reset: resetSpot,
  } = useForm<SpotData>({ resolver: zodResolver(spotSchema) });

  useEffect(() => {
    dispatch(fetchParkings());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleParkingSubmitForm = async (data: ParkingData) => {
    try {
      if (selectedParking) {
        await dispatch(
          updateParking({
            id: selectedParking.id,
            data: {
              name: data.name,
              address: data.address,
              pricePerHour: data.pricePerHour,
            },
          })
        ).unwrap();
        toast.success("Parking updated successfully!");
      } else {
        await dispatch(
          createParking({
            name: data.name,
            address: data.address,
            price: data.pricePerHour,
          })
        ).unwrap();
        toast.success("Parking created successfully!");
      }
      setIsParkingModalOpen(false);
      setSelectedParking(null);
      resetParking();
    } catch (err) {
      toast.error("Failed to save parking");
    }
  };

  const handleSpotSubmitForm = async (data: SpotData) => {
    if (!selectedParking) return;
    try {
      await dispatch(
        createParkingSpot({
          parkingId: selectedParking.id,
          data: {
            number: data.spotNumber,
            status: data.status,
          },
        })
      ).unwrap();
      toast.success("Spot created successfully!");
      setIsSpotModalOpen(false);
      resetSpot();
    } catch (err) {
      toast.error("Failed to create spot");
    }
  };

  const handleDeleteParking = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this parking?")) {
      try {
        await dispatch(deleteParking(id)).unwrap();
        toast.success("Parking deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete parking");
      }
    }
  };

  const handleEditParking = (parking: any) => {
    setSelectedParking(parking);
    setParkingValue("name", parking.name);
    setParkingValue("address", parking.address);
    setParkingValue("pricePerHour", parking.pricePerHour);
    setIsParkingModalOpen(true);
  };

  const handleExport = () => {
    exportToExcel(parkings, "parkings");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Parking Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsParkingModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Parking
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Export to Excel
            </button>
          </div>
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
                  {["Name", "Address", "Price/Hour", "Spots", "Actions"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parkings.map((parking: any) => (
                  <React.Fragment key={parking.id}>
                    <tr className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {parking.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {parking.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          ${parking.pricePerHour}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            setExpandedParkingId(
                              expandedParkingId === parking.id
                                ? null
                                : parking.id
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition duration-150"
                        >
                          {parking.spots.length} Spots
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditParking(parking)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition duration-150"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteParking(parking.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-md transition duration-150"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedParkingId === parking.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <button
                              onClick={() => {
                                setSelectedParking(parking);
                                setIsSpotModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition duration-150"
                            >
                              Add Spot
                            </button>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Spot Number
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {parking.spots.map((spot: any) => (
                                    <tr
                                      key={spot.id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {spot.spotNumber}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <span
                                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            spot.isOccupied
                                              ? "bg-red-100 text-red-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {spot.isOccupied
                                            ? "Occupied"
                                            : "Available"}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Parking Modal */}
        {isParkingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {selectedParking ? "Edit Parking" : "Add Parking"}
                </h2>
                <form
                  onSubmit={handleParkingSubmit(handleParkingSubmitForm)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      {...registerParking("name")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {parkingErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {parkingErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      {...registerParking("address")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {parkingErrors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {parkingErrors.address.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Hour
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...registerParking("pricePerHour", {
                        valueAsNumber: true,
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {parkingErrors.pricePerHour && (
                      <p className="mt-1 text-sm text-red-600">
                        {parkingErrors.pricePerHour.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsParkingModalOpen(false);
                        setSelectedParking(null);
                        resetParking();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Spot Modal */}
        {isSpotModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Add Parking Spot
                </h2>
                <form
                  onSubmit={handleSpotSubmit(handleSpotSubmitForm)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spot Number
                    </label>
                    <input
                      {...registerSpot("spotNumber")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {spotErrors.spotNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {spotErrors.spotNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      {...registerSpot("status")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    {spotErrors.status && (
                      <p className="mt-1 text-sm text-red-600">
                        {spotErrors.status.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsSpotModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminParkingPage;
