import { Swiper, SwiperSlide } from 'swiper/react';
import { useAuth } from '../../services/authContext';
import { useEffect, useState } from 'react';
import GameCard from '../../components/GameCard/GameCard';
import { gamesData, type RecentGame } from '../../models/gamesData';
import './Favourites.css';
import { userService } from '../../services/userService';
import { useTranslation } from 'react-i18next';

function Favourites() {
  const { user } = useAuth();
  const [favouriteGames, setFavourites] = useState<any[]>([]);
  const [games, setGames] = useState<RecentGame[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    userService.getRecentGames()
      .then((res) => setGames(res || [])); 
  }, []);
  

  useEffect(() => {
    if (user && user.favourites) {
      const filtered = gamesData.filter((game) =>
        user.favourites ?
        user.favourites.includes(game.title) : ''
      );
      setFavourites(filtered);
    }
  }, [user]);

  return (
    <div className="page w-full">
      <p className="header">{t("Favourites")}</p>
      {favouriteGames.length > 0 ? (
        <Swiper spaceBetween={20} slidesPerView={3} className="mySwiper">
          {favouriteGames.map((game, index) => (
            <SwiperSlide key={index}>
              <GameCard title={game.title} imgSrc={game.imgSrc} path={game.path} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="empty-state">{t("No favourite games yet")}</div>
      )}

      <p className="header">{t("Recent")}</p>
      {games.length > 0 ? (
        <Swiper spaceBetween={20} slidesPerView={5} className="mySwiper">
          {games.map((game, index) => (
            <SwiperSlide key={index}>
              <GameCard
                showFavorites={false}
                title={game.title}
                imgSrc={`/games/${game.title.replace(/\s+/g, '')}.png`}
                path={`/games/${game.title.replace(/\s+/g, '')}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="empty-state">{t("No recent games played")}</div>
      )}
    </div>
  );
}

export default Favourites;
