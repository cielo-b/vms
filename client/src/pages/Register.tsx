import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { signupUser, clearError } from "../features/auth/auth.slice";
import type { SignupPayload } from "../types/auth";

const RegisterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

type RegisterData = z.infer<typeof RegisterSchema>;

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
  });

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterData) => {
    try {
      const payload: SignupPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const resultAction = await dispatch(signupUser(payload));

      if (signupUser.fulfilled.match(resultAction)) {
        toast.success("Registration successful! Please log in.");
        reset();
        navigate("/");
      }
    } catch (error: any) {
      // Error handling in useEffect above
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading ? (
              <span className="flex items-center justify-center">
                <Spinner />
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/" className="text-blue-600 hover:underline font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
);
