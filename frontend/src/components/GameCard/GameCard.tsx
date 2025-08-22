import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import { FastAverageColor } from 'fast-average-color';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function GameCard({ title, imgSrc, path }: { title: string; imgSrc: string; path: string; }) {
    const [overlayColor, setOverlayColor] = useState('rgba(0,0,0,0.6)');
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const fac = new FastAverageColor(); 
        fac.getColorAsync(imgRef.current)
            .then(color => setOverlayColor(color.rgba));
        return () => fac.destroy();
    }, [imgSrc]);

    return (
    <Link to={path} style={{ textDecoration: 'none' }}>
        <Card sx={{ width: '100%', height: 220, background: 'var(--color-backgroound-darker)', borderRadius: '15px', overflow: 'hidden' }}>
            <CardActionArea sx={{ height: '100%', position: 'relative' }}>
                <CardMedia component="img" image={imgSrc} alt="slot game" sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}/>

                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    p: 1,
                    background: `linear-gradient(to top, ${overlayColor}, transparent)`,
                }}>
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
                        }}>
                        {title}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    </Link>
    );
}

export default GameCard;