import { Link } from "react-router-dom";

function GameCard({ title, path }: { title: string; path: string }) {
    return (
    <Link
    to={path}
    className="p-6 bg-gray-800 text-white rounded-2xl shadow hover:scale-105 transition"
    >
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-sm">Play now →</p>
    </Link>
    );
    }

    export default GameCard;