import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../../services/auth.service";
import type { RootState } from "../../app/store";

interface Parking {
  id: string;
  name: string;
  location: string;
  spots: ParkingSpot[];
  address: string;
}

interface ParkingSpot {
  id: string;
  number: string;
  status: "available" | "occupied" | "maintenance";
}

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  ownerId: string;
}

interface Booking {
  id: string;
  parkingId: string;
  spotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface Receipt {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

interface CustomerState {
  parkings: Parking[];
  vehicles: Vehicle[];
  bookings: Booking[];
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  parkings: [],
  vehicles: [],
  bookings: [],
  receipts: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAvailableParkings = createAsyncThunk(
  "customer/fetchAvailableParkings",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/parking", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parkings"
      );
    }
  }
);

export const bookParkingSpot = createAsyncThunk(
  "customer/bookParkingSpot",
  async (
    data: {
      parkingId: string;
      spotId: string;
      vehicleId: string;
      startTime: string;
      endTime: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.post("/booking/create", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to book parking"
      );
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  "customer/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/vehicle/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicles"
      );
    }
  }
);

export const createVehicle = createAsyncThunk(
  "customer/createVehicle",
  async (data: { plateNumber: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/vehicle", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vehicle"
      );
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "customer/updateVehicle",
  async (
    data: { id: string; data: { plateNumber: string } },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(`/vehicle/${data.id}`, data.data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vehicle"
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "customer/deleteVehicle",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
  }
);

export const fetchBookings = createAsyncThunk(
  "customer/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/booking/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "customer/cancelBooking",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

export const fetchReceipts = createAsyncThunk(
  "customer/fetchReceipts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/receipt/my-receipts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch receipts"
      );
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch parkings
    builder
      .addCase(fetchAvailableParkings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableParkings.fulfilled, (state, action) => {
        state.loading = false;
        state.parkings = action.payload;
      })
      .addCase(fetchAvailableParkings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Book parking spot
    builder
      .addCase(bookParkingSpot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookParkingSpot.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(bookParkingSpot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.push(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
      });

    // Bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    });

    // Receipts
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = customerSlice.actions;
export const selectCustomer = (state: RootState) => state.customer;
export const customerReducer = customerSlice.reducer;
