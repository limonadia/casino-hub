import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";


// ---- Navbar ----
function Navbar({ balance }: { balance: number }) {
return (
<nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
<h1 className="text-2xl font-bold">Casino Hub</h1>
<div className="flex gap-6">
<Link to="/">Home</Link>
<Link to="/games">Games</Link>
<Link to="/profile">Profile</Link>
</div>
<div>💰 Balance: {balance}</div>
</nav>
);
}

export default Navbar;