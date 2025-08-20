import GameCard from "../../components/GameCard/GameCard";

function Games() {
    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
    <GameCard title="Slot Machine" path="/games/slot" />
    <GameCard title="Blackjack" path="/games/blackjack" />
    <GameCard title="Roulette" path="/games/roulette" />
    </div>
    );
    }

    export default Games;