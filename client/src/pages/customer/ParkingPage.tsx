import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchAvailableParkings,
  fetchVehicles,
  bookParkingSpot,
} from "../../features/customer/customer.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const bookingSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().optional(),
  spotId: z.string(),
});

type BookingData = z.infer<typeof bookingSchema>;

const CustomerParkingPage = () => {
  const dispatch = useAppDispatch();
  const {
    parkings: availableParkings,
    vehicles,
    loading,
    error,
  } = useAppSelector((state) => state.customer);
  const [selectedParking, setSelectedParking] = useState<any | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingData>({ resolver: zodResolver(bookingSchema) });

  useEffect(() => {
    dispatch(fetchAvailableParkings());
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleBookSpot = async (spot: any) => {
    if (!selectedParking) return;
    const data = {
      parkingId: selectedParking.id,
      spotId: spot.id,
      vehicleId: vehicles[0]?.id,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Default to 1 hour later
    };
    try {
      await dispatch(bookParkingSpot(data)).unwrap();
      toast.success("Parking spot booked successfully!");
    } catch (err) {
      toast.error("Failed to book parking spot");
    }
  };

  const handleBookingSubmit = async (data: BookingData) => {
    if (!selectedParking) return;
    try {
      await dispatch(
        bookParkingSpot({
          ...data,
          parkingId: selectedParking.id,
          spotId: selectedParking.spots[0]?.id,
          endTime: data.endTime ?? data.startTime, // Ensure endTime is always a string
        })
      ).unwrap();
      toast.success("Booking created successfully!");
      reset();
      setSelectedParking(null);
    } catch (err) {
      toast.error("Failed to create booking");
    }
  };

  const handleExport = () => {
    exportToExcel(availableParkings, "available_parkings");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Available Parkings
          </h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableParkings.map((parking) => (
              <div
                key={parking.id}
                className="border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition duration-200 bg-white"
                onClick={() => setSelectedParking(parking)}
              >
                <h2 className="font-bold text-lg text-gray-800">
                  {parking.name}
                </h2>
                <p className="text-gray-600 mt-1">{parking.address}</p>
                <div className="mt-4 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm text-gray-700">
                    Available:{" "}
                    <span className="font-medium">
                      {parking.spots.filter((s: any) => !s.isOccupied).length} /{" "}
                      {parking.spots.length}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedParking && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedParking.name} - Parking Spots
              </h2>
              <button
                onClick={() => setSelectedParking(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition duration-150"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Spots Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Spots
                </h3>
                <div className="space-y-3">
                  {selectedParking.spots?.map((spot: any) => (
                    <div
                      key={spot.id}
                      className={`p-4 border rounded-lg flex items-center ${
                        spot.isOccupied
                          ? "bg-gray-50 border-gray-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-3 ${
                            spot.isOccupied ? "bg-gray-400" : "bg-green-500"
                          }`}
                        ></span>
                        <span className="font-medium">
                          Spot {spot.spotNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Form Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Book a Spot
                </h3>
                <form
                  onSubmit={handleSubmit(handleBookingSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Spot
                    </label>
                    <select
                      {...register("spotId")}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a parking spot</option>
                      {selectedParking.spots
                        .filter((spot: any) => !spot.isOccupied)
                        .map((spot: any) => (
                          <option key={spot.id} value={spot.id}>
                            Spot {spot.spotNumber}
                          </option>
                        ))}
                    </select>
                    {errors.spotId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.spotId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle
                    </label>
                    <select
                      {...register("vehicleId")}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((vehicle: any) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.licensePlate} - {vehicle.model}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.vehicleId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register("startTime")}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      {...register("endTime")}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Submit Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerParkingPage;
