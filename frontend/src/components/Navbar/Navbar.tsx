import { NavLink } from "react-router-dom";
import Balance from "../Balance/Balance";
import { useState } from "react";
import './Navbar.css';
import LanguageSelect from "../LanguageSelect/LanguageSelect";

function Navbar({ balance }: { balance: number }) {
    const [open, setOpen] = useState(false);
    const linkClasses = ({ isActive }: {isActive: boolean}) => isActive ? "active-link" : "";
    
return (
    <div className="p-4 bg-background-darker">

        {/* Desktop Navbar  */}
        <div className="hidden md:flex flex-row justify-between items-center">
            <div className="">
                <p className="text-5xl font-bold w-max">Casino Hub</p>
            </div>
            <div className="flex gap-6 items-center">
                <LanguageSelect/>
                <Balance balance={balance}/>
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
                <NavLink to="/favourites" className={linkClasses}>Favourites</NavLink>
                <NavLink to="/recent" className={linkClasses}>Recent</NavLink>
                <NavLink to="/profile" className={linkClasses}>Profile</NavLink>
                <NavLink to="/promotions" className={linkClasses}>Promotions</NavLink>
                <NavLink to="/contact" className={linkClasses}>Contact Us</NavLink>
                <NavLink to="/signout" className={linkClasses}>Sign Out / Login</NavLink>
                </div>
                <div className="flex flex-row w-full justify-between mt-3"><LanguageSelect/> <Balance balance={balance} /></div>
            </div>
        )}
    </div>
);
}

export default Navbar;