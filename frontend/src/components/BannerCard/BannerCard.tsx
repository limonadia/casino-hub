import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import ButtonComponent from '../Button/Button';

interface props {
    imgSrc: string;
    description: string;
    buttonText: string
  }

function BannerCard({imgSrc, buttonText, description}: props){
    return(
        <>
            <Card sx={{ width: '100%', height:150, borderRadius: '15px' }}>
                <CardActionArea sx={{ height: '100%'}}>
                    <CardContent sx={{ backgroundImage: `url(${imgSrc})`,backgroundSize: 'cover', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', gap: 1 }}>
                    
                    <Typography variant="h6" sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
                        textAlign: 'start'
                    }}>
                        {description}
                    </Typography>
                    <div className='flex w-1/4 flex-col items-start'>
                    <ButtonComponent buttonText={buttonText}/>
                    </div>
                    </CardContent>
                </CardActionArea>
                </Card>
        </>
    )
}

export default BannerCard;