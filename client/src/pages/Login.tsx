import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { loginUser, clearError } from "../features/auth/auth.slice";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERole } from "../enums/ERole";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated, according to user role
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role == ERole.ADMIN) {
        navigate("/dashboard/admin/parking");
      } else {
        navigate("/dashboard/customer/parking");
      }
    }
  }, [isAuthenticated, navigate]);

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data: LoginData) => {
    try {
      const resultAction = await dispatch(loginUser(data));

      if (loginUser.rejected.match(resultAction)) {
        // The error toast will be handled by the useEffect above
        return;
      }

      // Success - redirect will be handled by isAuthenticated effect
      toast.success("Login successful! 🎉");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex justify-center items-center">
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
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            You don't have an account yet?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
