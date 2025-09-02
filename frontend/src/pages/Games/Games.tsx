import GameCard from "../../components/GameCard/GameCard";
import {gamesData} from "../../models/gamesData"

function Games() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {gamesData.map((game, index) => (
            <GameCard key={index} title={game.title} path={game.path} imgSrc={game.imgSrc} />
            ))}
        </div>
    );
    }

    export default Games;