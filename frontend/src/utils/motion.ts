import { Variants } from 'framer-motion';

/**
 * Shared motion easing curve: premium, natural cubic-bezier deceleration
 */
export const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Standard viewport trigger parameters across all homepage sections:
 * Triggers once when 15% of the element enters the viewport.
 */
export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.15,
} as const;

/**
 * Preset A: Fade Up
 * Opacity: 0 -> 1, Y: 30px -> 0, Duration: 0.7s
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      delay: customDelay,
    },
  }),
};

/**
 * Preset B: Staggered Container & Children
 * Stagger delay: 0.12s
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: customDelay,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: SMOOTH_EASE,
    },
  },
};

/**
 * Preset C: Scale Reveal
 * Scale: 0.96 -> 1, Opacity: 0 -> 1, Duration: 0.7s
 */
export const scaleRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      delay: customDelay,
    },
  }),
};

/**
 * Preset D: Slide Reveal (Left and Right)
 * X: ±25px -> 0, Opacity: 0 -> 1, Duration: 0.7s
 */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -25 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      delay: customDelay,
    },
  }),
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 25 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      delay: customDelay,
    },
  }),
};

/**
 * Standard Spring Physics Presets
 */
export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 500,
  damping: 32,
} as const;

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
} as const;

export const SPRING_LAYOUT = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
} as const;

/**
 * Preset E: Coordinated Workspace Panels Entrance
 */
export const panelEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: SMOOTH_EASE,
      delay: customDelay,
    },
  }),
};

/**
 * Preset F: Token Sequence Stagger
 */
export const tokenSequenceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
    },
  },
};

export const tokenChipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 450,
      damping: 26,
    },
  },
};

/**
 * Preset G: Micro-Interaction Button Presses
 */
export const buttonPress = {
  tap: { scale: 0.96 },
  hover: { scale: 1.02 },
} as const;
