import GameCard from "../../components/GameCard/GameCard";
import slot1 from "../../assets/slot3.png";
import slot2 from "../../assets/closeup-slot-machine-with-pink-blue-lights_1282444-127645.avif";
import blackjack from "../../assets/blackjack.avif"
import roulette from "../../assets/roulette.jpg"
import baccarat from "../../assets/baccarat.avif"
import keno from "../../assets/keno.png"
import scratch from "../../assets/scratch.webp"
import hi_lo from "../../assets/hi-lo.webp"

function Games() {
    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
    <GameCard title="Royal Slots" path="/games/slot" imgSrc={slot2}/>
    <GameCard title="Blackjack" path="/games/blackjack" imgSrc={blackjack}/>
    <GameCard title="Roulette" path="/games/roulette" imgSrc={roulette}/>
    <GameCard title="Baccarat" path="/games/baccarat" imgSrc={baccarat}/>
    <GameCard title="Winner Slots" path="/games/progressive-slot" imgSrc={slot1}/>
    <GameCard title="Keno" path="/games/keno" imgSrc={keno}/>
    <GameCard title="Scratch card" path="/games/scratch" imgSrc={scratch}/>
    <GameCard title="Hi-Lo" path="/games/high-low" imgSrc={hi_lo}/>
    </div>
    );
    }

    export default Games;