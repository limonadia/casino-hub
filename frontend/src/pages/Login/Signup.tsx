import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ButtonComponent from "../../components/Button/Button";
import { useRef, useState } from "react";
import { authService } from "../../services/authService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { useNotifications } from "../../services/notificationContext";

function Signup() {

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const { success, error } = useNotifications();

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => {setShowPassword(!showPassword)};
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); 
    };
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setName] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    const formIsValid = username && email && password && !errors.username && !errors.email && !errors.password && !errors.confirmPassword;

    const handleUsernameChange = (value: string) => {
        setName(value);
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
        const errorObj = validationService.minLengthValidator(value, 8);
        setErrors((prev) => ({
          ...prev,
          password: validationErrorService.getErrorMessage(errorObj),
        }));
      };
      
      const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
      
        const errorMsg =
          value !== password
            ? "Passwords do not match"
            : "";
      
        setErrors((prev) => ({
          ...prev,
          confirmPassword: errorMsg,
        }));
      };

      

    const signup = async () => {
    
        const newErrors: { [key: string]: string } = {};

        const usernameError = validationService.requiredValidator(username, "Username");
        const emailError = validationService.emailValidator(email);
        const passwordError = validationService.minLengthValidator(password, 8);
        const confirmPasswordError = confirmPassword !== password ? { key: "passwordMismatch", params: {} }: null;

        if (confirmPasswordError)
          newErrors.confirmPassword = "Passwords do not match";


                if (usernameError) newErrors.username = validationErrorService.getErrorMessage(usernameError);
                if (emailError) newErrors.email = validationErrorService.getErrorMessage(emailError);
                if (passwordError) newErrors.password = validationErrorService.getErrorMessage(passwordError);

                setErrors(newErrors);
                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }
                setErrors({});
            
                try {
                    await authService.signup({ username, email, password, balance: 5000 });
                    success("User created successfully!")
                    navigate("/login");
                } catch (err: any) {
                    error("Signup failed. Please try again.")
                    setErrors({ general: err.message || "Signup failed" });
                }
    };

    const handleKeyDown = (field: string) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        switch (field) {
          case "username":
            emailRef.current?.focus();
            break;
          case "email":
            passwordRef.current?.focus();
            break;
          case "password":
            confirmPasswordRef.current?.focus();
            break;
          case "confirmPassword":
            signup(); // trigger signup on last field
            break;
        }
      }
    };
    

    return (
    <div className="text-center page lg:mx-10 h-full">
        <div className="flex justify-center items-start h-screen">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-black">Signup Form</h2>
                    
                <div className="py-5 h-96 flex items-center flex-col justify-between w-80">
                    <TextField label="Username" type="text" value={username} onChange={(e) => handleUsernameChange(e.target.value)} fullWidth
                        variant="outlined"  error={!!errors.username} helperText={errors.username} onKeyDown={handleKeyDown("username")} inputRef={usernameRef}/>

                    <TextField label="Email" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} fullWidth
                        variant="outlined" error={!!errors.email} helperText={errors.email} inputRef={emailRef}  onKeyDown={handleKeyDown("email")}/>

                    <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => handlePasswordChange(e.target.value)} fullWidth variant="outlined"
                            error={!!errors.password} helperText={errors.password} inputRef={passwordRef} onKeyDown={handleKeyDown("password")}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton sx={{ padding: 0, margin: 0, background: 'white'}}
                                      aria-label={showPassword ? 'hide the password' : 'display the password'}
                                      onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}
                                      onMouseUp={handleMouseDownPassword} edge="end">
                                        <span className="material-icons bg-white"> 
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </IconButton>
                                </InputAdornment>
                                ),
                            }}/>
                    <TextField label="Confirm Password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => handleConfirmPasswordChange(e.target.value)} fullWidth
                        variant="outlined"  error={!!errors.confirmPassword} helperText={errors.confirmPassword} inputRef={confirmPasswordRef} onKeyDown={handleKeyDown("confirmPassword")} 
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                sx={{ padding: 0, margin: 0, background: 'white'}}
                                aria-label={showPassword ? 'hide password' : 'show password'}
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseDownPassword}
                                edge="end"
                                >
                                <span className="material-icons bg-white">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}/>
                    </div>

                <ButtonComponent buttonText="Signup" onClick={signup} disabled={!formIsValid} />
                
                <p className="text-black pt-3">Already have an account? <Link to="/login" className="text-casinoPink !text-casinoPink"> Login</Link></p> 
            </div>
        </div>
    </div>
    );
}

export default Signup;