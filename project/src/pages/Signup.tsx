import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Zap, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { toast } from "react-toastify";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await signup(email, password, confirmPassword);
      toast.success("Account created successfully!");
    } catch (error) {
      // Error is already handled in the store
    }
  };

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?
            <a
              href="/login"
              className="ml-1 font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline transition-colors duration-200"
            >
              Sign in
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Password strength indicators */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Password strength:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center ${
                      hasMinLength ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasMinLength ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="h-3 w-3 mr-1 rounded-full border border-gray-300"></span>
                    )}
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center ${
                      hasUpperCase ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasUpperCase ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="h-3 w-3 mr-1 rounded-full border border-gray-300"></span>
                    )}
                    Uppercase letter
                  </div>
                  <div
                    className={`flex items-center ${
                      hasLowerCase ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasLowerCase ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="h-3 w-3 mr-1 rounded-full border border-gray-300"></span>
                    )}
                    Lowercase letter
                  </div>
                  <div
                    className={`flex items-center ${
                      hasNumber ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasNumber ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="h-3 w-3 mr-1 rounded-full border border-gray-300"></span>
                    )}
                    Number
                  </div>
                  <div
                    className={`flex items-center ${
                      hasSpecialChar ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {hasSpecialChar ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <span className="h-3 w-3 mr-1 rounded-full border border-gray-300"></span>
                    )}
                    Special character
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 text-red-900 placeholder-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <a href="#" className="text-purple-600 hover:text-purple-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 hover:text-purple-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              {isLoading ? (
                <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                  <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                </span>
              ) : (
                <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                  <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
              Create account
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22,12c0-5.523-4.477-10-10-10S2,6.477,2,12c0,4.991,3.657,9.128,8.438,9.878v-6.987h-2.54V12h2.54V9.797c0-2.506,1.492-3.89,3.777-3.89c1.094,0,2.238,0.195,2.238,0.195v2.46h-1.26c-1.243,0-1.63,0.771-1.63,1.562V12h2.773l-0.443,2.89h-2.33v6.988C18.343,21.128,22,16.991,22,12z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
