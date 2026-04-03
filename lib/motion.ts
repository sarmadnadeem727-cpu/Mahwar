import { Variants } from "framer-motion";

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.75, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { 
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.05 
    } 
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.65, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.75, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.75, 
      ease: EASE_PREMIUM 
    } 
  }
};

export const cardHover = {
  rest: { y: 0 },
  hover: { 
    y: -6, 
    transition: { 
      type: 'spring', 
      damping: 28, 
      stiffness: 180 
    } 
  }
};

export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { 
      duration: 2, 
      ease: 'easeInOut' 
    } 
  }
};
