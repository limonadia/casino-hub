import { useState } from 'react';
import React from 'react';
import { type ReactNode } from 'react';
import './Gallery.css';
import casinoPink from "../../assets/casino-pink.avif";
import jackpot from "../../assets/jackpot.webp";
import slot1 from "../../assets/slot1.webp";
import slot2 from "../../assets/slots.png";
import slot3 from "../../assets/slot3.png";




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
      
      <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition w-10">
        &#9664;
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition w-10">
        &#9654;
      </button>

      {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-2">
        {React.Children.map(children, (_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-pink-500' : 'bg-gray-400'}`}/>
        ))}
      </div> */}
    </div>
  );
};

function Gallery() {
    const [images] = useState([
        { src: casinoPink, alt: 'Casino' },
        { src: jackpot, alt: 'Jackpot' },
        { src: slot1, alt: 'Slot' },
        { src: slot2, alt: 'Slot' },
        { src: slot3, alt: 'Slot' },
    ]);

    return (
        <div className="flex justify-center items-center bg-background-lighter w-full h-1/2">
            <div className="w-full h-full shadow-lg rounded-lg overflow-hidden">
                <Carousel>
                    {images.map((image, index) => (
                        <div key={index}>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="object-cover w-full h-auto"
                            />
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
}

export default Gallery;
