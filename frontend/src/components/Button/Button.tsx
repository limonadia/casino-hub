import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)({
    width: '100%',
    padding: '5px',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
    backgroundColor: 'var(--color-casinoPink) !important',
  
    '&:hover, &:active, &:focus': {
      transform: 'scale(1.05)',
      background: 'linear-gradient(135deg, #ff4d94, #ff99c8)',
      boxShadow: '0 8px 20px rgba(255, 0, 128, 0.4)', 
      border: 'none',
    },

  });

interface ButtonProperties {
    buttonText: string;
}

function ButtonComponent({buttonText}: ButtonProperties){
    return(
        <>
            <StyledButton variant="contained">
                {buttonText}
            </StyledButton>
        </>
    )
}

export default ButtonComponent;