import { useCallback } from 'react';

export const useCarousel = () => {
  const scrollCarousel = useCallback(
    (direction: 'left' | 'right', carouselId: string) => {
      const carousel = document.getElementById(carouselId);
      if (!carousel) return;

      const cardWidth = 280; // Template card width + gap
      const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
      const currentScrollLeft = carousel.scrollLeft;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

      let newPosition;
      if (direction === 'left') {
        newPosition = Math.max(0, currentScrollLeft - scrollAmount);
      } else {
        newPosition = Math.min(maxScrollLeft, currentScrollLeft + scrollAmount);
      }

      carousel.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
    },
    []
  );

  return {
    scrollCarousel,
  };
};
