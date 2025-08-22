import GameCard from "../../components/GameCard/GameCard";
import slot3 from "../../assets/slot3.png";
import slot2 from "../../assets/slot1.webp";
import casino from "../../assets/closeup-slot-machine-with-pink-blue-lights_1282444-127645.avif"

function Games() {
    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
    <GameCard title="Slot Machine" path="/games/slot" imgSrc={slot3}/>
    <GameCard title="Blackjack" path="/games/blackjack" imgSrc={slot2}/>
    <GameCard title="Roulette" path="/games/roulette" imgSrc={casino}/>
    <GameCard title="Baccarat" path="/games/baccarat" imgSrc={casino}/>
    <GameCard title="Progressive Slot" path="/games/progressive-slot" imgSrc={casino}/>
    <GameCard title="Keno" path="/games/keno" imgSrc={casino}/>
    <GameCard title="Scratch" path="/games/scratch" imgSrc={casino}/>
    <GameCard title="High" path="/games/high-low" imgSrc={casino}/>
    </div>
    );
    }

    export default Games;