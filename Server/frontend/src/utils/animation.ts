
import { Variants } from 'framer-motion';

// Stagger container animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Stagger item animation with fade and slide up
export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Card animation with scale
export const cardAnimation: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// List item animation 
export const listItemAnimation: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }),
  hover: {
    x: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Page transition animation
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.19, 1, 0.22, 1]
    }
  }
};

// Image zoom-in effect animation
export const imageZoomAnimation: Variants = {
  hidden: { scale: 1.2, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1]
    }
  }
};

// Button hover animation
export const buttonAnimation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.03, 
    y: -3,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  },
  tap: { 
    scale: 0.97,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10
    }
  }
};

// Rotate animation for icons
export const rotateAnimation: Variants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: {
      duration: 20,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Moving gradient animation
export const gradientAnimation: Variants = {
  initial: { backgroundPosition: "0% 50%" },
  animate: { 
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 15,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Shimmer loading animation
export const shimmerAnimation: Variants = {
  initial: {
    backgroundPosition: "-500px 0"
  },
  animate: {
    backgroundPosition: ["calc(-500px)", "calc(500px + 100%)"],
    transition: {
      duration: 2.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

// Helper function to create staggered delay for children
export const getStaggeredDelay = (index: number, baseDelay: number = 0.1): number => {
  return baseDelay * index;
};

// Helper function to create scroll-triggered animations
export const createScrollAnimation = (threshold: number = 0.1): Variants => {
  return {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };
};
