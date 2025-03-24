
import React, { useState } from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import { Image } from '../types/api';
import { alpha } from '@mui/system';

interface ImageCarouselProps {
  images: Image[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Nessuna immagine disponibile
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          height: 400,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'black',
          '&:hover .carousel-controls': {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          onClick={handleZoom}
        >
          <img
            src={images[currentIndex].image_path}
            alt={images[currentIndex].description || 'Image'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              cursor: 'zoom-in',
            }}
          />
          <IconButton
            onClick={handleZoom}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
              zIndex: 2,
            }}
          >
            <ZoomInIcon />
          </IconButton>
        </Box>

        <Box
          className="carousel-controls"
          sx={{
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            p: 1.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            {images[currentIndex].description || 'Immagine'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {currentIndex + 1} di {images.length}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          mt: 2,
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 3,
          },
        }}
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            onClick={() => handleThumbnailClick(index)}
            sx={{
              width: 80,
              height: 80,
              flexShrink: 0,
              borderRadius: 2,
              overflow: 'hidden',
              border: index === currentIndex ? '2px solid' : '2px solid transparent',
              borderColor: index === currentIndex ? theme.palette.primary.main : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: index === currentIndex ? 1 : 0.7,
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <img
              src={image.thumb_small_path}
              alt={image.description || 'Thumbnail'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Fullscreen view */}
      {isZoomed && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCloseZoom}
        >
          <IconButton
            onClick={handleCloseZoom}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <img
            src={images[currentIndex].original_path || images[currentIndex].image_path}
            alt={images[currentIndex].description || 'Image'}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.6)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {images[currentIndex].description || 'Immagine'}
            </Typography>
            <Typography variant="caption">
              {currentIndex + 1} di {images.length}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageCarousel;
