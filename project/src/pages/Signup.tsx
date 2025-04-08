import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Zap, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Types
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// Constants
const FORM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const INPUT_ANIMATION = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.99 }
};

const PASSWORD_REQUIREMENTS = [
  { id: 'minLength', label: 'At least 8 characters', test: (pass: string) => pass.length >= 8 },
  { id: 'upperCase', label: 'Uppercase letter', test: (pass: string) => /[A-Z]/.test(pass) },
  { id: 'lowerCase', label: 'Lowercase letter', test: (pass: string) => /[a-z]/.test(pass) },
  { id: 'number', label: 'Number', test: (pass: string) => /[0-9]/.test(pass) },
  { id: 'specialChar', label: 'Special character', test: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass) }
];

// Component
const Signup: React.FC = () => {
  // State
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Hooks
  const { signup, isLoading, error, clearError } = useAuthStore();

  // Effects
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await signup(formData.email, formData.password);
      toast.success("Account created successfully!");
    } catch (error) {
      // Error is already handled in the store
    }
  };

  // Computed
  const passwordStrength: PasswordStrength = {
    hasMinLength: PASSWORD_REQUIREMENTS[0].test(formData.password),
    hasUpperCase: PASSWORD_REQUIREMENTS[1].test(formData.password),
    hasLowerCase: PASSWORD_REQUIREMENTS[2].test(formData.password),
    hasNumber: PASSWORD_REQUIREMENTS[3].test(formData.password),
    hasSpecialChar: PASSWORD_REQUIREMENTS[4].test(formData.password)
  };

  // Render
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl"
        variants={FORM_VARIANTS}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div 
            className="flex justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <motion.div 
                className="mt-1 relative rounded-md shadow-sm"
                {...INPUT_ANIMATION}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800"
                  placeholder="Enter your email"
                />
              </motion.div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <motion.div 
                className="mt-1 relative rounded-md shadow-sm"
                {...INPUT_ANIMATION}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800"
                  placeholder="Enter your password"
                />
              </motion.div>

              {/* Password Strength Indicators */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Password strength:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PASSWORD_REQUIREMENTS.map(({ id, label, test }) => (
                    <div
                      key={id}
                      className={`flex items-center ${
                        test(formData.password) ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {test(formData.password) ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1 rounded-full border border-gray-300" />
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <motion.div 
                className="mt-1 relative rounded-md shadow-sm"
                {...INPUT_ANIMATION}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
              </motion.div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
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

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </motion.button>
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
      </motion.div>
    </motion.div>
  );
};

export default Signup;
