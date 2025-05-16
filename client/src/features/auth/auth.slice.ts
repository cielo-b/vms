import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { login, signup } from "../../services/auth.service";
import type { User, LoginPayload, SignupPayload } from "../../types/auth";
import { jwtDecode } from "jwt-decode";
import type { ERole } from "../../enums/ERole";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface TokenResponse {
  token: string;
  [key: string]: any; // For any additional fields the API might return
}

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  role: ERole;
  [key: string]: any;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

// Helper function to handle auth state persistence
const persistAuthState = (token: string, user: User) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Helper function to decode JWT token
const decodeToken = (token: string): User => {
  try {
    console.log(token);
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      token: token,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Invalid token");
  }
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await login(payload);

      // Check if the response has the expected structure
      if (!response.data || !response.data.data) {
        return rejectWithValue("Invalid response from server");
      }

      const token = response.data.data;
      const userData = decodeToken(token);

      return {
        token,
        user: userData,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (payload: SignupPayload, { rejectWithValue }) => {
    try {
      const response = await signup(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setAuthState: (
      state,
      action: PayloadAction<{ user: User | null; token: string | null }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!(action.payload.user && action.payload.token);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Login fulfilled
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        persistAuthState(action.payload.token, action.payload.user);
      })

      // Login rejected
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Signup pending
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Signup fulfilled
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        // We don't authenticate the user here, they need to login separately
      })

      // Signup rejected
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setAuthState, clearError } = authSlice.actions;
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;

export const authReducer = authSlice.reducer;
