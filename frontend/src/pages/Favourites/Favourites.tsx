import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useAuth } from '../../services/authContext';
import { useEffect, useState } from 'react';
import GameCard from '../../components/GameCard/GameCard';
import { gamesData, type RecentGame } from '../../models/gamesData';
import './Favourites.css'
import { userService } from '../../services/userService';

function Favourites(){
    const { user } = useAuth();
    const [favouriteGames, setFavourites]= useState<any[]>([]);
    const [games, setGames] = useState<RecentGame[]>([]);

    useEffect(() => {
      userService.getRecentGames()
        .then(setGames);
    }, []);

    useEffect(() => {
        if (user && user.favourites) {
          const filtered = gamesData.filter(game =>
            user.favourites.includes(game.title)
          );
          setFavourites(filtered);
        }
      }, [user]);       
    
    return (
    <>  <div className='page w-full'>
          <p className='header'>Favourites</p>
          <Swiper spaceBetween={20} slidesPerView={3} className="mySwiper"> 
            {favouriteGames.map((game, index) => (
              <SwiperSlide key={index}>
                <GameCard title={game.title} imgSrc={game.imgSrc} path={game.path} />
              </SwiperSlide>))}
          </Swiper>
          <p className='header'>Recent</p>
          <Swiper spaceBetween={20} slidesPerView={5} className="mySwiper"> 
            {games.map((game, index) => (
              <SwiperSlide key={index}>
                <GameCard showFavorites={false} title={game.title} imgSrc={'/games/'+game.title.replace(/\s+/g, '')+'.png'} path={`/games/${game.title.replace(/\s+/g, '')}`}/>
            </SwiperSlide>))}
          </Swiper>
        </div>
    </>
    );
}

export default Favourites;