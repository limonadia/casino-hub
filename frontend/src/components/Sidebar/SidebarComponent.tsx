import { useState } from "react";
import { Sidebar, sidebarClasses, Menu, menuClasses, MenuItem } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import './SidebarComponent.css';

function SideBarComponent() {
  const [isToggled, setIsToggled] = useState(false);
  const handleToggle = () => {
    setIsToggled(prev => !prev);
  };

  const location = useLocation(); 
  const isActive = (path: string) => location.pathname === path;

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  return (
    <Sidebar collapsed={isToggled} rootStyles={{
        [`.${sidebarClasses.container}`]: {
          height: '100%',
          background: 'var(--color-background-darker)',
        }}}>
      <Menu rootStyles={{
          height: '100%',
          [`.${menuClasses.label}`]: {
            justifyContent: 'start',
            display: 'flex',
            alignContent: 'center',
          },
          [`.${menuClasses.button}`]: {
            ':hover': {
              backgroundColor: 'var(--color-background-lighter)',
            },
          }}}>
        <MenuItem>
          <button onClick={handleToggle} className='menu-button'>
            <span className="material-symbols-outlined text-casinoPink pr-4 pl-2 menu-icon">menu</span>
          </button>
        </MenuItem>
        <MenuItem component={<Link to="/" />} className={isActive("/") ? "active-item-link" : ""}>
          <span className="material-symbols-outlined text-casinoPink px-7">home</span> Home
        </MenuItem>
        <MenuItem component={<Link to="/games" />} className={isActive("/games") ? "active-item-link" : ""}>
          <span className="material-symbols-outlined text-casinoPink px-7">casino</span> Games
        </MenuItem>

        {isLoggedIn && (
          <>
            <MenuItem component={<Link to="/favourites" />} className={isActive("/favourites") ? "active-item-link" : ""}>
              <span className="material-symbols-outlined text-casinoPink px-7">bookmark_heart</span> Favourites
            </MenuItem>
            <MenuItem component={<Link to="/recent" />} className={isActive("/recent") ? "active-item-link" : ""}>
              <span className="material-symbols-outlined text-casinoPink px-7">history_2</span> Recent
            </MenuItem>
            <MenuItem component={<Link to="/profile" />} className={isActive("/profile") ? "active-item-link" : ""}>
              <span className="material-symbols-outlined text-casinoPink px-7">person</span> Profile
            </MenuItem>
          </>
        )}
        
        <MenuItem component={<Link to="/promotions" />} className={isActive("/promotions") ? "active-item-link" : ""}>
          <span className="material-symbols-outlined text-casinoPink px-7">featured_seasonal_and_gifts</span> Promotions
        </MenuItem>
        <MenuItem component={<Link to="/contact" />} className={isActive("/contact") ? "active-item-link" : ""}>
          <span className="material-symbols-outlined text-casinoPink px-7">support_agent</span> Contact Us
        </MenuItem>
        <MenuItem className={isActive("/signout") || isActive("/login") ? "active-item-link" : ""} onClick={() => {
          if (isLoggedIn) {  localStorage.removeItem("token");  window.location.href = "/"; }}}
          component={!isLoggedIn ? <Link to="/login" /> : undefined}>
          <span className="material-symbols-outlined text-casinoPink px-7">
            {isLoggedIn ? "logout" : "login"}
          </span>{" "}{isLoggedIn ? "Sign Out" : "Login"}
        </MenuItem>
      </Menu>
    </Sidebar>
  );
}

export default SideBarComponent;
