import { NavLink } from "react-router-dom";
import Balance from "../Balance/Balance";
import { useState } from "react";
import './Navbar.css';
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import ButtonComponent from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authContext";

function Navbar() {
    const { token, balance } = useAuth();
    const [open, setOpen] = useState(false);
    const linkClasses = ({ isActive }: {isActive: boolean}) => isActive ? "active-link" : "";
    const navigate = useNavigate();
    const isLoggedIn = !!token;
    const toLogin = () => {
        navigate("/login"); 
      };

return (
    <div className="p-4 bg-background-darker">

        {/* Desktop Navbar  */}
        <div className="hidden md:flex flex-row justify-between items-center">
            <div className="">
                <p className="text-5xl font-bold w-max">Casino Hub</p>
            </div>
            <div className="flex gap-6 items-center">
                <LanguageSelect/>
                <div>
                    {token ? ( <Balance balance={balance} /> ) : (<ButtonComponent buttonText="Login" onClick={toLogin} />)}
                </div>
            </div>
        </div>

        {/* Mobile Navbar */}
        <div className="flex md:hidden justify-between items-center">
            <p className="text-3xl sm:text-4xl font-bold">Casino Hub</p>
            <button className="material-symbols-outlined text-3xl nav-menu-button" onClick={() => setOpen(!open)}>
            {open? 'close' : 'menu'}
            </button>
        </div>

        {/* Mobile Dropdown */}
        {open && (
            <div className="w-full md:hidden flex flex-col justify-center items-center">
                <div className="md:hidden flex flex-col gap-4 mt-4 w-max">
                    <NavLink to="/" className={linkClasses}>Home</NavLink>
                    <NavLink to="/games" className={linkClasses}>Games</NavLink>
                    {isLoggedIn && (<>
                        <NavLink to="/favourites" className={linkClasses}>Favourites</NavLink>
                        <NavLink to="/promotions" className={linkClasses}>Promotions</NavLink>
                        <NavLink to="/profile" className={linkClasses}>Profile</NavLink></>
                    )}
                    <NavLink to="/contact" className={linkClasses}>Contact Us</NavLink>
                    <NavLink to={isLoggedIn ? "/signout" : "/login"} className={linkClasses} onClick={() => { 
                        if (isLoggedIn) {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                            }}}>
                    {isLoggedIn ? "Sign Out" : "Login"}
                    </NavLink>                
                </div>
                <div className="flex flex-row w-full justify-between mt-3"><LanguageSelect/> <Balance balance={balance} /></div>
            </div>
        )}
    </div>
);
}

export default Navbar;