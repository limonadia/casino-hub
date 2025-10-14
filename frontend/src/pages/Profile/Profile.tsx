import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ButtonComponent from "../../components/Button/Button";
import { userService } from "../../services/userService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { useNotifications } from "../../services/notificationContext";
import { useAuth } from "../../services/authContext";

function Profile() {
  const { success, error } = useNotifications();
  const { user, setUser } = useAuth();

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

 
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const formIsValid =
    username &&
    email &&
    (!password || password.length >= 8) &&
    (!password || confirmPassword === password) &&
    !errors.username &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const errorObj = validationService.requiredValidator(value, "Username");
    setErrors((prev) => ({
      ...prev,
      username: validationErrorService.getErrorMessage(errorObj),
    }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const errorObj = validationService.emailValidator(value);
    setErrors((prev) => ({
      ...prev,
      email: validationErrorService.getErrorMessage(errorObj),
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const errorObj = value ? validationService.minLengthValidator(value, 8) : null;
    setErrors((prev) => ({
      ...prev,
      password: validationErrorService.getErrorMessage(errorObj),
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const errorMsg = password && value !== password ? "Passwords do not match" : "";
    setErrors((prev) => ({
      ...prev,
      confirmPassword: errorMsg,
    }));
  };

  
  const updateProfile = async () => {
    const newErrors: { [key: string]: string } = {};

    const usernameError = validationService.requiredValidator(username, "Username");
    const emailError = validationService.emailValidator(email);
    const passwordError = password ? validationService.minLengthValidator(password, 8) : null;
    const confirmPasswordError =
      password && confirmPassword !== password
        ? { key: "passwordMismatch", params: {} }
        : null;

    if (usernameError) newErrors.username = validationErrorService.getErrorMessage(usernameError);
    if (emailError) newErrors.email = validationErrorService.getErrorMessage(emailError);
    if (passwordError) newErrors.password = validationErrorService.getErrorMessage(passwordError);
    if (confirmPasswordError) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const updatedUser = await userService.updateProfile({
        username,
        email,
        password: password || undefined,
      });

      setUser(updatedUser);
      success("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      error("Update failed. Please try again.");
      setErrors({ general: err.message || "Update failed" });
    }
  };

  return (
    <div className="text-center page lg:mx-10 h-screen w-screen">
      <div className="flex justify-center items-start h-full ">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md h-4/7 flex flex-col justify-between h-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">Update Profile</h2>

          <div className="py-5 flex items-center flex-col justify-between w-11/12 space-y-4 h-full gap-2 w-full">
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.username}
              helperText={errors.username}
              inputRef={usernameRef}
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
              inputRef={emailRef}
            />

            <TextField
              label="New Password (optional)"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              inputRef={passwordRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ padding: 0, margin: 0, background: "white" }}
                      aria-label={showPassword ? "hide password" : "show password"}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      <span className="material-icons bg-white">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              inputRef={confirmPasswordRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ padding: 0, margin: 0, background: "white" }}
                      aria-label={showPassword ? "hide password" : "show password"}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      <span className="material-icons bg-white">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <ButtonComponent
            buttonText="Update Profile"
            onClick={updateProfile}
            disabled={!formIsValid}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
