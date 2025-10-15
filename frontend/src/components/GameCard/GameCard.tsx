import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import { FastAverageColor } from 'fast-average-color';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { IconButton } from '@mui/material';
import { useAuth } from '../../services/authContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './GameCard.css';

function GameCard({ title, imgSrc, path, showFavorites = true }: { title: string; imgSrc: string; path: string; showFavorites?: boolean}) {
    const [overlayColor, setOverlayColor] = useState('rgba(0,0,0,0.6)');
    const imgRef = useRef<HTMLImageElement | null>(null);
    const { user, setUser, isLoading } = useAuth();

    const [isFavourite, setIsFavourite] = useState(false);

    useEffect(() => {
        
        if (!isLoading) {
            if (user && user.favourites) {
                const normalizedTitle = title.trim().toLowerCase();
                const isFav = user.favourites.some(fav => 
                    fav.trim().toLowerCase() === normalizedTitle
                );
                setIsFavourite(isFav);
            } else {
                setIsFavourite(false);
            }
        }
    }, [user, title, isLoading]);

    useEffect(() => {
        if (!imgRef.current) return;

        const fac = new FastAverageColor(); 
        fac.getColorAsync(imgRef.current)
            .then(color => setOverlayColor(color.rgba));
        return () => fac.destroy();
    }, [imgSrc]);

    const handleToggleFavourite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 
        if (!user) return;

        try {
            const res: any = await userService.toggleFavourite(title);

            setIsFavourite(prev => !prev);

            setUser({
                ...user,
                favourites: res.status === 'added'
                    ? [...(user.favourites || []), title]
                    : (user.favourites || []).filter(g => g !== title)
            });
        } catch (err) {
            console.error("Failed to toggle favourite", err);
        }
    };

    return (
        <Link to={path} style={{ textDecoration: 'none' }}>
            <Card
  sx={{
    width: '100%',
    height: 220,
    background: 'var(--color-backgroound-darker)',
    borderRadius: '15px',
    overflow: 'hidden',
    position: 'relative',  
  }}
>
  {!isLoading && user && showFavorites && (
    <IconButton
      onClick={handleToggleFavourite}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
        color: isFavourite ? '#db2777' : 'white',
        zIndex: 2,  
      }}
    >
      {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  )}

  <CardActionArea sx={{ height: '100%', position: 'relative' }}>
    <CardMedia
      ref={imgRef}
      component="img"
      image={imgSrc}
      alt="slot game"
      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        p: 1,
        background: `linear-gradient(to top, ${overlayColor}, transparent)`,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '0.9rem',
          letterSpacing: '0.5px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </Typography>
    </Box>
  </CardActionArea>
</Card>

        </Link>
    );
}

export default GameCard;