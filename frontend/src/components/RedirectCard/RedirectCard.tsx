import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import ButtonComponent from '../Button/Button';
interface RedirectCardProps {
    imgSrc: string;
    description: string;
    buttonText: string
  }

function RedirectCard({ imgSrc, description, buttonText }: RedirectCardProps) {
  return (
    <Card sx={{ width: '100%', height:320, background: 'var(--color-backgroound-darker)', borderRadius: '15px' }}>
      <CardActionArea sx={{ height: '100%'}}>
        <div style={{ width: '100%', height: '60%' }}>
        <CardMedia
          component="img"
          image={imgSrc}
          alt="slot game"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', 
          }}
        />
        </div>
        <CardContent sx={{ height: '40%', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{
              color: 'white',
              textAlign: 'start',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical',
            }}>
            {description}
          </Typography>
          <ButtonComponent buttonText={buttonText}/>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default RedirectCard;