import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth/auth.slice";
import { customerReducer } from "../features/customer/customer.slice";
import { adminReducer } from "../features/admin/admin.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
