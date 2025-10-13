import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../../components/Button/Button";
import { authService } from "../../services/authService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { useNotifications } from "../../services/notificationContext";

function ResetPassword() {
  const { success, error } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      error("Invalid or missing token.");
      navigate("/forgot");
    } else {
      setToken(t);
    }
  }, [searchParams, error, navigate]);

  const handleResetPassword = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validation
    const passwordError = validationService.requiredValidator(password, "Password");
    const confirmError = validationService.requiredValidator(confirmPassword, "Confirm Password");

    if (passwordError) newErrors.password = validationErrorService.getErrorMessage(passwordError);
    if (confirmError) newErrors.confirmPassword = validationErrorService.getErrorMessage(confirmError);
    if (!newErrors.confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!token) return;

    try {
      setIsLoading(true);
      // Call your resetPassword API
      await authService.resetPassword(token, password);
      success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      const message = err.message || "Unable to reset password. Try again later.";
      error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formIsValid = password && confirmPassword && Object.keys(errors).length === 0;

  return (
    <div className="text-center page lg:mx-10 h-full">
      <div className="flex justify-center items-start h-screen">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Reset Password
          </h2>

          <div className="py-5 flex flex-col gap-4 w-80">
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </div>

          <ButtonComponent
            buttonText={isLoading ? "Resetting..." : "Reset Password"}
            onClick={handleResetPassword}
            disabled={!formIsValid || isLoading}
          />

          <p className="text-black pt-3 text-sm">
            Remember your password?{" "}
            <Link to="/login" className="text-casinoPink !text-casinoPink">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
