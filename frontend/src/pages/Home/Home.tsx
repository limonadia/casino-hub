import Gallery from "../../components/Gallery/Gallery";
import RedirectCard from "../../components/RedirectCard/RedirectCard";
import slot3 from "../../assets/slot3.png";
import slot2 from "../../assets/slot1.webp";

function Home() {
    return (
        <>
        <div className="text-center page lg:mx-10 h-full">
            <Gallery />
            <div className="flex flex-col md:flex-row w-full justify-between items-center gap-7 md:gap-4 pt-15">
                <RedirectCard imgSrc={slot3} description="Explore our growing range of top-tier games designed to thrill and keep you entertained around the clock." buttonText="Go to Casino"/>
                <RedirectCard imgSrc={slot2} description="Spin the reels, chase jackpots, and experience nonstop excitement with every play." buttonText="Play Now"/>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Casino Hub 🎰</h2>
            <p>Select a game and try your luck with fake coins!</p>
        </div></>
    );
    }

    export default Home;