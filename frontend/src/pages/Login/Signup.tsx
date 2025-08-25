import { TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ButtonComponent from "../../components/Button/Button";
import { useState } from "react";
import { authService } from "../../services/authService";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const signup = async () => {
        try{
            const response = await authService.signup({ username, email, password});
            console.log("Signup response:", response);
            navigate("/login");
        } catch (err: any){
            setError(err.message || "Signup failed");
        }
    };

    return (
    <div className="text-center page lg:mx-10 h-full">
        <div className="flex justify-center items-start h-screen">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-black">Signup Form</h2>
                    
                <div className="py-5 h-60 flex items-center flex-col justify-between w-80">
                    <TextField label="Username" type="text" value={username} onChange={(e) => setName(e.target.value)} fullWidth variant="outlined"/>
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined"/>
                    <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined"/>
                </div>

                <ButtonComponent buttonText="Signup" onClick={signup} />
                
                <p className="text-black pt-3">Already have an account?<Link to="/login" className="text-casinoPink !text-casinoPink">Login</Link></p> 
            </div>
        </div>
    </div>
    );
}

    export default Signup;