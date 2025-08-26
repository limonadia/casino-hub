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

    "&.Mui-disabled": {
    backgroundColor: "var(--color-disabled-casinoPink) !important", 
    color: "#F0F0F0",
    cursor: "not-allowed", 
  },

});

interface ButtonProperties {
    buttonText: string;
    onClick?: () => void;
    disabled?: boolean; 
}

function ButtonComponent({buttonText, onClick, disabled = false}: ButtonProperties){
    return(
        <>
            <StyledButton variant="contained" onClick={onClick} disabled={disabled}>
                {buttonText}
            </StyledButton>
        </>
    )
}

export default ButtonComponent;