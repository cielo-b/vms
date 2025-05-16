import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "../../services/auth.service";
import type { RootState } from "../../app/store";

interface Parking {
  id: string;
  name: string;
  location: string;
  spots: ParkingSpot[];
  totalSpots: number;
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

interface ParkingRequest {
  id: string;
  parkingId: string;
  vehicleId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ExitRequest {
  id: string;
  parkingId: string;
  vehicleId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface Receipt {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

interface AdminState {
  parkings: Parking[];
  vehicles: Vehicle[];
  bookings: Booking[];
  parkingRequests: ParkingRequest[];
  exitRequests: ExitRequest[];
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  parkings: [],
  vehicles: [],
  bookings: [],
  parkingRequests: [],
  exitRequests: [],
  receipts: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchParkings = createAsyncThunk(
  "admin/fetchParkings",
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

export const createParking = createAsyncThunk(
  "admin/createParking",
  async (
    data: {
      name: string;
      address: string;
      price: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/parking/create", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create parking"
      );
    }
  }
);

export const updateParking = createAsyncThunk(
  "admin/updateParking",
  async (
    data: {
      id: string;
      data: { name: string; address: string; pricePerHour: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(`/parking/${data.id}`, data.data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update parking"
      );
    }
  }
);

export const deleteParking = createAsyncThunk(
  "admin/deleteParking",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/parking/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete parking"
      );
    }
  }
);

export const createParkingSpot = createAsyncThunk(
  "admin/createParkingSpot",
  async (
    data: { parkingId: string; data: { number: string; status: string } },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.post(
        `/parking/${data.parkingId}/spots/create`,
        data.data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create parking spot"
      );
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  "admin/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/vehicle", {
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

export const fetchBookings = createAsyncThunk(
  "admin/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/booking", {
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

export const updateBookingStatus = createAsyncThunk(
  "admin/updateBookingStatus",
  async (
    data: { id: string; status: "confirmed" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.patch(`/bookings/${data.id}/status`, {
        status: data.status,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update booking status"
      );
    }
  }
);

export const fetchParkingRequests = createAsyncThunk(
  "admin/fetchParkingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/parking-requests");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch parking requests"
      );
    }
  }
);

export const updateParkingRequest = createAsyncThunk(
  "admin/updateParkingRequest",
  async (
    data: { id: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.patch(`/parking-requests/${data.id}`, {
        status: data.status,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update parking request"
      );
    }
  }
);

export const fetchExitRequests = createAsyncThunk(
  "admin/fetchExitRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/exit-requests");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch exit requests"
      );
    }
  }
);

export const updateExitRequest = createAsyncThunk(
  "admin/updateExitRequest",
  async (
    data: { id: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.patch(`/exit-requests/${data.id}`, {
        status: data.status,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update exit request"
      );
    }
  }
);

export const fetchReceipts = createAsyncThunk(
  "admin/fetchReceipts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/receipt", {
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

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Parkings
    builder
      .addCase(fetchParkings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParkings.fulfilled, (state, action) => {
        state.loading = false;
        state.parkings = action.payload;
      })
      .addCase(fetchParkings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createParking.fulfilled, (state, action) => {
        state.parkings.push(action.payload);
      })
      .addCase(updateParking.fulfilled, (state, action) => {
        const index = state.parkings.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.parkings[index] = action.payload;
        }
      })
      .addCase(deleteParking.fulfilled, (state, action) => {
        state.parkings = state.parkings.filter((p) => p.id !== action.payload);
      })
      .addCase(createParkingSpot.fulfilled, (state, action) => {
        const parking = state.parkings.find(
          (p) => p.id === action.payload.parkingId
        );
        if (parking) {
          parking.spots.push(action.payload);
        }
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
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });

    // Parking Requests
    builder
      .addCase(fetchParkingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParkingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.parkingRequests = action.payload;
      })
      .addCase(fetchParkingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateParkingRequest.fulfilled, (state, action) => {
        const index = state.parkingRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.parkingRequests[index] = action.payload;
        }
      });

    // Exit Requests
    builder
      .addCase(fetchExitRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExitRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.exitRequests = action.payload;
      })
      .addCase(fetchExitRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExitRequest.fulfilled, (state, action) => {
        const index = state.exitRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.exitRequests[index] = action.payload;
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

export const { clearError } = adminSlice.actions;
export const selectAdmin = (state: RootState) => state.admin;
export const adminReducer = adminSlice.reducer;
