import { useState } from 'react';
import React from 'react';
import { type ReactNode } from 'react';
import './Gallery.css';
import casinoPink from "../../assets/casino-pink.avif";
import jackpot from "/games/ProgressiveSlot.png";
import slot1 from "../../assets/slot1.webp";
import slot2 from "../../assets/slots.png";
import slot3 from "/games/Slot.png";
import ButtonComponent from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CarouselProps {
  children?: ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    const slides = React.Children.toArray(children);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    const slides = React.Children.toArray(children);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden h-full">
      <div className="flex transition-transform duration-500 h-full ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {React.Children.map(children, (child) => (
          <div className="flex-none w-full h-full">
            {child}
          </div>
        ))}
      </div>
      
      <button onClick={prevSlide} className="absolute top-1/2  -translate-y-1/2 bg-gray-800 text-white opacity-70 p-2 hover:opacity-100 transition hidden md:block">
        &#9664;
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-0 -translate-y-1/2 bg-gray-800 text-white opacity-70 p-2 hover:opacity-100 transition hidden md:block">
        &#9654;
      </button>

      <button onClick={prevSlide} className="carousel-previous carousel-button">
        &#9664;
      </button>
      <button onClick={nextSlide} className="carousel-next carousel-button">
        &#9654;
      </button>

    </div>
  );
};

function Gallery() {
  const navigate = useNavigate();
    const [images] = useState([
        { src: casinoPink, alt: 'Casino' },
        { src: jackpot, alt: 'Jackpot' },
        { src: slot1, alt: 'Slot' },
        { src: slot2, alt: 'Slot' },
        { src: slot3, alt: 'Slot' },
    ]);

    const toPromotions = () =>{
      navigate("/promotions");
    }
const { t } = useTranslation();


    return (
        <div className="flex justify-center items-center bg-background-lighter w-full image-div">
            <div className="w-full h-full  rounded-lg overflow-hidden">
                <Carousel>
                  {images.map((image, index) => (
                    <div key={index} className="w-full h-full shadow-none relative flex items-start">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="object-cover w-full h-auto"
                      />

                      {index === 0 && ( 
                        <div className="absolute top-1/9 left-8 bg-black/70 p-6 rounded-lg text-white max-w-md overlay-box">
                          <h2 className="text-casinoPink text-xl font-bold mb-2">
                            {t("The Bonus Vault is Open!")}
                          </h2>
                          <p className="text-sm mb-4">
                            {t("Step in now and claim your exclusive rewards. Massive bonuses are waiting just for you!")}
                          </p>
                          <ButtonComponent buttonText={t("Win Free Coins")} onClick={toPromotions} />
                        </div>
                      )}
                    </div>
                  ))}
                </Carousel>
            </div>
        </div>
    );
}

export default Gallery;
