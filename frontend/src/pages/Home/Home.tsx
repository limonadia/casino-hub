import Gallery from "../../components/Gallery/Gallery";
import RedirectCard from "../../components/RedirectCard/RedirectCard";
import slot3 from "../../assets/slot3.png";
import slot2 from "../../assets/slot1.webp";
import casino from "../../assets/closeup-slot-machine-with-pink-blue-lights_1282444-127645.avif"
import BannerCard from "../../components/BannerCard/BannerCard";

function Home() {
    return (
        <>
        <div className="text-center page lg:mx-10 h-full">
            <Gallery />
            <div className="flex flex-col md:flex-row w-full justify-between items-center gap-7 md:gap-4 pt-15 pb-8">
                <RedirectCard imgSrc={slot3} description="Explore our growing range of top-tier games designed to thrill and keep you entertained around the clock." buttonText="Go to Casino"/>
                <RedirectCard imgSrc={slot2} description="Spin the reels, chase jackpots, and experience nonstop excitement with every play." buttonText="Play Now"/>
            </div>
            <BannerCard imgSrc={casino} description="Signup now and grab 1000 free Coins!" buttonText="Signup"/>
        </div></>
    );
    }

    export default Home;