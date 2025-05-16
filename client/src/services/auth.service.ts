import axios from "axios";
import type { LoginPayload, SignupPayload } from "../types/auth";

export const API = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = (payload: LoginPayload) =>
  API.post("/auth/login", payload);
export const signup = (payload: SignupPayload) =>
  API.post("/user/register", payload);
