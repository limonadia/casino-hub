import { Link } from "react-router-dom";

function Navbar({ balance }: { balance: number }) {
return (
<div className="flex flex-row justify-between items-center p-4 bg-gray-900 ">
    <div className="">
        <h1 className="text-2xl font-bold w-max text-red">Casino Hub</h1>
    </div>
    <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/games">Games</Link>
        <Link to="/profile">Profile</Link>
        <div className="text-red-500  text-red">💰 Balance: {balance}</div>
    </div>
</div>
);
}

export default Navbar;