import { useState } from "react";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../../components/Button/Button";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { useNotifications } from "../../services/notificationContext";
import { useTranslation } from "react-i18next";

function Forgot() {
  const { success, error } = useNotifications();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleForgotPassword = async () => {
    const newErrors: { [key: string]: string } = {};
    const emailError = validationService.requiredValidator(email, "Email");
    if (emailError)
      newErrors.email = validationErrorService.getErrorMessage(emailError);

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      success(t("Password reset link sent! Please check your email."));
      setEmail("");
    } catch (err: any) {
      const message = err.message || t("Something went wrong");
      if (message.includes("404") || message.includes("not found")) {
        error(t("Email does not exist."));
      } else {
        error(t("Unable to send reset link. Try again later."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formIsValid = email && !errors.email;

  return (
    <div className="text-center page lg:mx-10 h-full">
      <div className="flex justify-center items-start h-screen">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            {t("Forgot Password")}
          </h2>

          <div className="py-5 flex items-center flex-col justify-between w-80">
            <TextField
              label={t("Email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
            />
          </div>

          <ButtonComponent
            buttonText={isLoading ? t("Sending...") : t("Send Reset Link")}
            onClick={handleForgotPassword}
            disabled={!formIsValid || isLoading}
          />

          <p className="text-black pt-3 text-sm">
            {t("Remember your password?")}{" "}
            <Link to="/login" className="text-casinoPink !text-casinoPink">
              {t("Back to Login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Forgot;
