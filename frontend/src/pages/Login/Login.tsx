import { useRef, useState } from "react";
import ButtonComponent from "../../components/Button/Button";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { validationService } from "../../validation/validationService";
import { validationErrorService } from "../../validation/validationErrorService";
import { IconButton, InputAdornment } from "@mui/material";
import { useNotifications } from "../../services/notificationContext";
import { useAuth } from "../../services/authContext";
import { useTranslation } from "react-i18next";

 function Login() {
    const { error } = useNotifications();
    const { setToken } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => {setShowPassword(!showPassword)};
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); 
    };
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const formIsValid = email && password && !errors.email && !errors.password && password.length >=8;
    
    const navigate = useNavigate();

    const passwordRef = useRef<HTMLInputElement>(null);

    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          if (!email) return; 
          if (!password && passwordRef.current) {
            passwordRef.current.focus();
            e.preventDefault();
          } else {
            login();
          }
        }
      };
      
      const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          if (!password && passwordRef.current) {
            passwordRef.current.focus();
            e.preventDefault();
          } else {
            login();
          }
        }
      };

    const login = async () => {
        const newErrors: { [key: string]: string } = {};
        const emailError = validationService.requiredValidator(email, t("Email"));
        const passwordError = validationService.requiredValidator(password, t("Password"));
        if (emailError) newErrors.email = validationErrorService.getErrorMessage(emailError);
        if (passwordError) newErrors.password = validationErrorService.getErrorMessage(passwordError);

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            const response = await authService.login({ email, password });
            localStorage.setItem("token",response.token);
            setToken(String(response));
            navigate("/");
        } catch (err: any) {
            const message = err.message || t("Login failed");

            if (message.includes("401") || message.includes("Invalid credentials")) {
                error(t("Incorrect password."));
            } else if (message.includes("404") || message.includes("not found")) {
                error(t("Email does not exist"));
            } else {
                error(t("Something went wrong. Please try again later."))
            }
        }
      };

    return (
        <div className="text-center page lg:mx-10 h-full">
            <div className="flex justify-center items-start h-screen">
                <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black">{t("Login Form")}</h2>
                    
                    <div className="py-5 h-44 flex items-center flex-col justify-between w-80">
                        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined"
                            error={!!errors.email} helperText={errors.email} onKeyDown={handleEmailKeyDown}/>
                        <TextField label={t("Password")} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined"
                            error={!!errors.password} helperText={errors.password} onKeyDown={handlePasswordKeyDown} inputRef={passwordRef}
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
                    </div>

                    <ButtonComponent buttonText={t("Login")} onClick={login} disabled={!formIsValid}/>

                    <p className="text-black pt-3">{t("Not a member?")} <Link to="/signup" className="text-casinoPink !text-casinoPink"> {t("Signup now")}</Link></p> 
                    <p className="text-xs underline pt-3"><Link to="/forgot" className="text-casinoPink !text-casinoPink"> {t("Forgot password")}</Link></p> 

                </div>
            </div>
        </div>
    );
}

    export default Login;