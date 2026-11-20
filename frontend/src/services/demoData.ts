import { PredictResponse } from '../types/api';

export interface DemoPreset {
  id: string;
  name: string;
  category: string;
  latex: string;
  description: string;
  response: PredictResponse;
}

// Helper to create a raster canvas for demo preprocessed preview
function createMockPreprocessedImage(latexTokens: string[]): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background white with slight borders matching backend canvas preprocessing
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw handwritten style expression
  ctx.fillStyle = '#05070B';
  ctx.font = 'italic 28px serif';
  ctx.textBaseline = 'middle';
  
  const text = latexTokens.join(' ').replace(/\\/g, '');
  ctx.fillText(text.slice(0, 40), 30, 48);

  return canvas.toDataURL('image/png');
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'quadratic',
    name: 'Quadratic Formula',
    category: 'Algebra',
    latex: '\\frac { - b \\pm \\sqrt { b ^ { 2 } - 4 a c } } { 2 a }',
    description: 'Standard roots of a second-degree polynomial ax² + bx + c = 0',
    response: {
      latex: '\\frac { - b \\pm \\sqrt { b ^ { 2 } - 4 a c } } { 2 a }',
      tokens: [
        { token: '\\frac', confidence: 0.9842, x: 0.08, y: 0.48, alternatives: [{ token: '\\sqrt', prob: 0.009 }, { token: '\\int', prob: 0.004 }] },
        { token: '{', confidence: 0.9912, x: 0.12, y: 0.32, alternatives: [{ token: '(', prob: 0.005 }, { token: '[', prob: 0.002 }] },
        { token: '-', confidence: 0.9531, x: 0.16, y: 0.32, alternatives: [{ token: '+', prob: 0.031 }, { token: '=', prob: 0.011 }] },
        { token: 'b', confidence: 0.9245, x: 0.22, y: 0.31, alternatives: [{ token: '6', prob: 0.048 }, { token: '\\beta', prob: 0.018 }, { token: 'h', prob: 0.005 }] },
        { token: '\\pm', confidence: 0.9412, x: 0.29, y: 0.32, alternatives: [{ token: '+', prob: 0.035 }, { token: '-', prob: 0.015 }] },
        { token: '\\sqrt', confidence: 0.9765, x: 0.38, y: 0.32, alternatives: [{ token: '\\sum', prob: 0.012 }, { token: 'v', prob: 0.006 }] },
        { token: '{', confidence: 0.9941, x: 0.43, y: 0.30, alternatives: [{ token: '(', prob: 0.003 }] },
        { token: 'b', confidence: 0.9381, x: 0.47, y: 0.33, alternatives: [{ token: '6', prob: 0.039 }, { token: 'h', prob: 0.012 }] },
        { token: '^', confidence: 0.9812, x: 0.51, y: 0.24, alternatives: [{ token: '_', prob: 0.012 }] },
        { token: '{', confidence: 0.9954, x: 0.53, y: 0.22, alternatives: [] },
        { token: '2', confidence: 0.9723, x: 0.56, y: 0.21, alternatives: [{ token: 'z', prob: 0.018 }, { token: '?', prob: 0.005 }] },
        { token: '}', confidence: 0.9950, x: 0.58, y: 0.22, alternatives: [] },
        { token: '-', confidence: 0.9632, x: 0.62, y: 0.32, alternatives: [{ token: '=', prob: 0.021 }] },
        { token: '4', confidence: 0.9541, x: 0.67, y: 0.32, alternatives: [{ token: '+', prob: 0.028 }, { token: 'a', prob: 0.011 }] },
        { token: 'a', confidence: 0.9412, x: 0.72, y: 0.33, alternatives: [{ token: '\\alpha', prob: 0.038 }, { token: 'o', prob: 0.012 }] },
        { token: 'c', confidence: 0.9124, x: 0.77, y: 0.33, alternatives: [{ token: 'e', prob: 0.052 }, { token: '(', prob: 0.021 }] },
        { token: '}', confidence: 0.9961, x: 0.81, y: 0.31, alternatives: [] },
        { token: '}', confidence: 0.9972, x: 0.83, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9943, x: 0.44, y: 0.68, alternatives: [] },
        { token: '2', confidence: 0.9812, x: 0.48, y: 0.69, alternatives: [{ token: 'z', prob: 0.012 }] },
        { token: 'a', confidence: 0.9542, x: 0.54, y: 0.70, alternatives: [{ token: '\\alpha', prob: 0.031 }, { token: 'q', prob: 0.009 }] },
        { token: '}', confidence: 0.9965, x: 0.58, y: 0.71, alternatives: [] },
      ],
      avg_confidence: 0.9658,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: '(-b \\pm \\sqrt{b^2 - 4ac})/(2a)',
      },
      preprocessed_image: createMockPreprocessedImage(['\\frac', '-', 'b', '\\pm', '\\sqrt', 'b^2-4ac', '2a']),
      latency_ms: 134.8,
    },
  },
  {
    id: 'gaussian_integral',
    name: 'Gaussian Definite Integral',
    category: 'Calculus',
    latex: '\\int _ { 0 } ^ { \\infty } e ^ { - x ^ { 2 } } d x = \\frac { \\sqrt { \\pi } } { 2 }',
    description: 'Improper integral of the standard normal density curve kernel',
    response: {
      latex: '\\int _ { 0 } ^ { \\infty } e ^ { - x ^ { 2 } } d x = \\frac { \\sqrt { \\pi } } { 2 }',
      tokens: [
        { token: '\\int', confidence: 0.9881, x: 0.06, y: 0.48, alternatives: [{ token: '(', prob: 0.008 }] },
        { token: '_', confidence: 0.9742, x: 0.09, y: 0.72, alternatives: [{ token: '-', prob: 0.015 }] },
        { token: '{', confidence: 0.9961, x: 0.11, y: 0.73, alternatives: [] },
        { token: '0', confidence: 0.9652, x: 0.13, y: 0.74, alternatives: [{ token: 'O', prob: 0.021 }, { token: 'o', prob: 0.008 }] },
        { token: '}', confidence: 0.9972, x: 0.15, y: 0.73, alternatives: [] },
        { token: '^', confidence: 0.9821, x: 0.09, y: 0.22, alternatives: [] },
        { token: '{', confidence: 0.9980, x: 0.11, y: 0.21, alternatives: [] },
        { token: '\\infty', confidence: 0.9521, x: 0.14, y: 0.20, alternatives: [{ token: '8', prob: 0.034 }, { token: '\\alpha', prob: 0.009 }] },
        { token: '}', confidence: 0.9981, x: 0.16, y: 0.21, alternatives: [] },
        { token: 'e', confidence: 0.9412, x: 0.22, y: 0.48, alternatives: [{ token: 'c', prob: 0.039 }] },
        { token: '^', confidence: 0.9782, x: 0.25, y: 0.35, alternatives: [] },
        { token: '{', confidence: 0.9965, x: 0.27, y: 0.33, alternatives: [] },
        { token: '-', confidence: 0.9612, x: 0.30, y: 0.32, alternatives: [{ token: '+', prob: 0.022 }] },
        { token: 'x', confidence: 0.9541, x: 0.34, y: 0.33, alternatives: [{ token: 'X', prob: 0.031 }, { token: '\\times', prob: 0.010 }] },
        { token: '^', confidence: 0.9721, x: 0.37, y: 0.22, alternatives: [] },
        { token: '{', confidence: 0.9978, x: 0.39, y: 0.20, alternatives: [] },
        { token: '2', confidence: 0.9634, x: 0.42, y: 0.19, alternatives: [{ token: 'z', prob: 0.024 }] },
        { token: '}', confidence: 0.9982, x: 0.44, y: 0.20, alternatives: [] },
        { token: '}', confidence: 0.9985, x: 0.46, y: 0.28, alternatives: [] },
        { token: 'd', confidence: 0.9421, x: 0.52, y: 0.49, alternatives: [{ token: '\\partial', prob: 0.032 }, { token: 'a', prob: 0.015 }] },
        { token: 'x', confidence: 0.9654, x: 0.57, y: 0.49, alternatives: [{ token: 'X', prob: 0.022 }] },
        { token: '=', confidence: 0.9892, x: 0.65, y: 0.49, alternatives: [{ token: '-', prob: 0.007 }] },
        { token: '\\frac', confidence: 0.9854, x: 0.74, y: 0.48, alternatives: [] },
        { token: '{', confidence: 0.9971, x: 0.77, y: 0.33, alternatives: [] },
        { token: '\\sqrt', confidence: 0.9742, x: 0.81, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9981, x: 0.84, y: 0.31, alternatives: [] },
        { token: '\\pi', confidence: 0.9521, x: 0.87, y: 0.32, alternatives: [{ token: 'n', prob: 0.028 }, { token: 'T', prob: 0.011 }] },
        { token: '}', confidence: 0.9982, x: 0.90, y: 0.31, alternatives: [] },
        { token: '}', confidence: 0.9985, x: 0.91, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9974, x: 0.80, y: 0.68, alternatives: [] },
        { token: '2', confidence: 0.9841, x: 0.84, y: 0.69, alternatives: [{ token: 'z', prob: 0.011 }] },
        { token: '}', confidence: 0.9984, x: 0.88, y: 0.68, alternatives: [] },
      ],
      avg_confidence: 0.9768,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: '\\frac{\\sqrt{\\pi}}{2}',
      },
      preprocessed_image: createMockPreprocessedImage(['\\int', 'e^{-x^2}', 'dx', '=', '\\sqrt{\\pi}/2']),
      latency_ms: 182.4,
    },
  },
  {
    id: 'basel_problem',
    name: 'Euler Basel Identity',
    category: 'Series',
    latex: '\\sum _ { n = 1 } ^ { \\infty } \\frac { 1 } { n ^ { 2 } } = \\frac { \\pi ^ { 2 } } { 6 }',
    description: 'Sum of reciprocal squares proved by Leonhard Euler in 1734',
    response: {
      latex: '\\sum _ { n = 1 } ^ { \\infty } \\frac { 1 } { n ^ { 2 } } = \\frac { \\pi ^ { 2 } } { 6 }',
      tokens: [
        { token: '\\sum', confidence: 0.9872, x: 0.10, y: 0.48, alternatives: [{ token: 'E', prob: 0.008 }] },
        { token: '_', confidence: 0.9741, x: 0.10, y: 0.72, alternatives: [] },
        { token: '{', confidence: 0.9951, x: 0.11, y: 0.74, alternatives: [] },
        { token: 'n', confidence: 0.9412, x: 0.13, y: 0.75, alternatives: [{ token: 'm', prob: 0.038 }] },
        { token: '=', confidence: 0.9821, x: 0.16, y: 0.74, alternatives: [] },
        { token: '1', confidence: 0.9712, x: 0.18, y: 0.75, alternatives: [{ token: 'l', prob: 0.019 }] },
        { token: '}', confidence: 0.9962, x: 0.19, y: 0.74, alternatives: [] },
        { token: '^', confidence: 0.9812, x: 0.10, y: 0.22, alternatives: [] },
        { token: '{', confidence: 0.9971, x: 0.11, y: 0.20, alternatives: [] },
        { token: '\\infty', confidence: 0.9541, x: 0.14, y: 0.19, alternatives: [{ token: '8', prob: 0.031 }] },
        { token: '}', confidence: 0.9982, x: 0.16, y: 0.20, alternatives: [] },
        { token: '\\frac', confidence: 0.9891, x: 0.28, y: 0.48, alternatives: [] },
        { token: '{', confidence: 0.9972, x: 0.31, y: 0.32, alternatives: [] },
        { token: '1', confidence: 0.9821, x: 0.35, y: 0.33, alternatives: [{ token: 'l', prob: 0.012 }] },
        { token: '}', confidence: 0.9984, x: 0.38, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9975, x: 0.30, y: 0.67, alternatives: [] },
        { token: 'n', confidence: 0.9382, x: 0.34, y: 0.68, alternatives: [{ token: 'm', prob: 0.042 }] },
        { token: '^', confidence: 0.9765, x: 0.38, y: 0.58, alternatives: [] },
        { token: '{', confidence: 0.9981, x: 0.40, y: 0.57, alternatives: [] },
        { token: '2', confidence: 0.9734, x: 0.43, y: 0.56, alternatives: [{ token: 'z', prob: 0.021 }] },
        { token: '}', confidence: 0.9985, x: 0.45, y: 0.57, alternatives: [] },
        { token: '}', confidence: 0.9987, x: 0.47, y: 0.66, alternatives: [] },
        { token: '=', confidence: 0.9912, x: 0.56, y: 0.49, alternatives: [] },
        { token: '\\frac', confidence: 0.9874, x: 0.68, y: 0.48, alternatives: [] },
        { token: '{', confidence: 0.9978, x: 0.71, y: 0.32, alternatives: [] },
        { token: '\\pi', confidence: 0.9542, x: 0.76, y: 0.31, alternatives: [{ token: 'n', prob: 0.029 }] },
        { token: '^', confidence: 0.9782, x: 0.80, y: 0.22, alternatives: [] },
        { token: '{', confidence: 0.9984, x: 0.82, y: 0.20, alternatives: [] },
        { token: '2', confidence: 0.9741, x: 0.85, y: 0.19, alternatives: [{ token: 'z', prob: 0.020 }] },
        { token: '}', confidence: 0.9988, x: 0.87, y: 0.20, alternatives: [] },
        { token: '}', confidence: 0.9991, x: 0.89, y: 0.31, alternatives: [] },
        { token: '{', confidence: 0.9979, x: 0.75, y: 0.68, alternatives: [] },
        { token: '6', confidence: 0.9612, x: 0.79, y: 0.69, alternatives: [{ token: 'b', prob: 0.029 }] },
        { token: '}', confidence: 0.9986, x: 0.83, y: 0.68, alternatives: [] },
      ],
      avg_confidence: 0.9785,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: '\\frac{\\pi^2}{6}',
      },
      preprocessed_image: createMockPreprocessedImage(['\\sum', '1/n^2', '=', '\\pi^2/6']),
      latency_ms: 195.1,
    },
  },
  {
    id: 'trig_identity',
    name: 'Pythagorean Trigonometric Identity',
    category: 'Trigonometry',
    latex: '\\sin ^ { 2 } \\theta + \\cos ^ { 2 } \\theta = 1',
    description: 'Fundamental trigonometric relation in Euclidean geometry',
    response: {
      latex: '\\sin ^ { 2 } \\theta + \\cos ^ { 2 } \\theta = 1',
      tokens: [
        { token: '\\sin', confidence: 0.9754, x: 0.12, y: 0.49, alternatives: [{ token: 's', prob: 0.015 }] },
        { token: '^', confidence: 0.9812, x: 0.18, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9971, x: 0.20, y: 0.30, alternatives: [] },
        { token: '2', confidence: 0.9734, x: 0.23, y: 0.29, alternatives: [{ token: 'z', prob: 0.021 }] },
        { token: '}', confidence: 0.9982, x: 0.25, y: 0.30, alternatives: [] },
        { token: '\\theta', confidence: 0.9412, x: 0.31, y: 0.49, alternatives: [{ token: '0', prob: 0.038 }, { token: 'o', prob: 0.012 }] },
        { token: '+', confidence: 0.9841, x: 0.42, y: 0.49, alternatives: [{ token: 't', prob: 0.011 }] },
        { token: '\\cos', confidence: 0.9682, x: 0.54, y: 0.49, alternatives: [{ token: 'c', prob: 0.021 }] },
        { token: '^', confidence: 0.9821, x: 0.60, y: 0.32, alternatives: [] },
        { token: '{', confidence: 0.9975, x: 0.62, y: 0.30, alternatives: [] },
        { token: '2', confidence: 0.9741, x: 0.65, y: 0.29, alternatives: [{ token: 'z', prob: 0.018 }] },
        { token: '}', confidence: 0.9984, x: 0.67, y: 0.30, alternatives: [] },
        { token: '\\theta', confidence: 0.9381, x: 0.73, y: 0.49, alternatives: [{ token: '0', prob: 0.041 }] },
        { token: '=', confidence: 0.9921, x: 0.83, y: 0.49, alternatives: [] },
        { token: '1', confidence: 0.9812, x: 0.91, y: 0.49, alternatives: [{ token: 'l', prob: 0.012 }] },
      ],
      avg_confidence: 0.9735,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: '1',
      },
      preprocessed_image: createMockPreprocessedImage(['\\sin^2', '\\theta', '+', '\\cos^2', '\\theta', '=', '1']),
      latency_ms: 122.3,
    },
  },
  {
    id: 'limit_sinc',
    name: 'Important Trigonometric Limit',
    category: 'Calculus',
    latex: '\\lim _ { x \\to 0 } \\frac { \\sin x } { x } = 1',
    description: 'Foundational limit for derivatives of trigonometric functions',
    response: {
      latex: '\\lim _ { x \\to 0 } \\frac { \\sin x } { x } = 1',
      tokens: [
        { token: '\\lim', confidence: 0.9682, x: 0.12, y: 0.45, alternatives: [{ token: 'l', prob: 0.021 }] },
        { token: '_', confidence: 0.9781, x: 0.12, y: 0.70, alternatives: [] },
        { token: '{', confidence: 0.9961, x: 0.13, y: 0.71, alternatives: [] },
        { token: 'x', confidence: 0.9521, x: 0.15, y: 0.72, alternatives: [{ token: 'X', prob: 0.031 }] },
        { token: '\\to', confidence: 0.9412, x: 0.19, y: 0.71, alternatives: [{ token: '\\rightarrow', prob: 0.042 }, { token: '-', prob: 0.012 }] },
        { token: '0', confidence: 0.9684, x: 0.23, y: 0.72, alternatives: [{ token: 'o', prob: 0.022 }] },
        { token: '}', confidence: 0.9972, x: 0.25, y: 0.71, alternatives: [] },
        { token: '\\frac', confidence: 0.9882, x: 0.42, y: 0.48, alternatives: [] },
        { token: '{', confidence: 0.9974, x: 0.44, y: 0.32, alternatives: [] },
        { token: '\\sin', confidence: 0.9642, x: 0.49, y: 0.31, alternatives: [] },
        { token: 'x', confidence: 0.9582, x: 0.56, y: 0.32, alternatives: [{ token: 'X', prob: 0.025 }] },
        { token: '}', confidence: 0.9981, x: 0.60, y: 0.31, alternatives: [] },
        { token: '{', confidence: 0.9978, x: 0.48, y: 0.68, alternatives: [] },
        { token: 'x', confidence: 0.9612, x: 0.52, y: 0.69, alternatives: [{ token: 'X', prob: 0.028 }] },
        { token: '}', confidence: 0.9984, x: 0.56, y: 0.68, alternatives: [] },
        { token: '=', confidence: 0.9912, x: 0.74, y: 0.48, alternatives: [] },
        { token: '1', confidence: 0.9824, x: 0.85, y: 0.48, alternatives: [{ token: 'l', prob: 0.011 }] },
      ],
      avg_confidence: 0.9754,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: '1',
      },
      preprocessed_image: createMockPreprocessedImage(['\\lim', 'x->0', '\\sin(x)/x', '=', '1']),
      latency_ms: 141.0,
    },
  },
  {
    id: 'mass_energy',
    name: 'Mass-Energy Equivalence',
    category: 'Physics',
    latex: 'E = m c ^ { 2 }',
    description: 'Einstein famous relativistic energy relation from Special Relativity',
    response: {
      latex: 'E = m c ^ { 2 }',
      tokens: [
        { token: 'E', confidence: 0.9812, x: 0.16, y: 0.49, alternatives: [{ token: '\\sum', prob: 0.011 }] },
        { token: '=', confidence: 0.9924, x: 0.34, y: 0.49, alternatives: [{ token: '-', prob: 0.005 }] },
        { token: 'm', confidence: 0.9521, x: 0.52, y: 0.49, alternatives: [{ token: 'n', prob: 0.038 }] },
        { token: 'c', confidence: 0.9412, x: 0.68, y: 0.49, alternatives: [{ token: 'e', prob: 0.045 }, { token: '(', prob: 0.012 }] },
        { token: '^', confidence: 0.9841, x: 0.76, y: 0.33, alternatives: [] },
        { token: '{', confidence: 0.9972, x: 0.79, y: 0.31, alternatives: [] },
        { token: '2', confidence: 0.9781, x: 0.84, y: 0.30, alternatives: [{ token: 'z', prob: 0.018 }] },
        { token: '}', confidence: 0.9985, x: 0.88, y: 0.31, alternatives: [] },
      ],
      avg_confidence: 0.9759,
      syntax_valid: true,
      sympy: {
        valid: true,
        simplified: 'c^2 m',
      },
      preprocessed_image: createMockPreprocessedImage(['E', '=', 'm', 'c^2']),
      latency_ms: 88.5,
    },
  },
];
