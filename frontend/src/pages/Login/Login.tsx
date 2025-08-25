import { useState } from "react";
import ButtonComponent from "../../components/Button/Button";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

 function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
          const response = await authService.login({ email, password });
          console.log("Login response:", response);
          navigate("/");
        } catch (err: any) {
          console.error(err.message || "Login failed");
        }
      };
      

    return (
        <div className="text-center page lg:mx-10 h-full">
            <div className="flex justify-center items-start h-screen">
                <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black">Login Form</h2>
                    
                    <div className="py-5 h-44 flex items-center flex-col justify-between w-80">
                        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined"/>
                        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined"/>
                    </div>

                    <ButtonComponent buttonText="Login" onClick={login} />

                    <p className="text-black pt-3">Not a member?<Link to="/signup" className="text-casinoPink !text-casinoPink">Signup now</Link></p> 
                </div>
            </div>
        </div>
    );
}

    export default Login;