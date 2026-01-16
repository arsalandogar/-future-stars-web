import { alpha, type CSSVariablesResolver } from '@mantine/core';

// Color variable references matching theme.ts
const COLORS = {
  primary: 'var(--mantine-color-primary-0)',
  primaryAlt: 'var(--mantine-color-primaryAlt-0)',
  primaryLight: 'var(--mantine-color-primaryLight-0)',
  secondary: 'var(--mantine-color-secondary-0)',
  border: 'var(--mantine-color-border-0)',
  success: 'var(--mantine-color-success-0)',
  error: 'var(--mantine-color-error-0)',
  warning: 'var(--mantine-color-warning-0)',
  white: 'var(--mantine-color-white)',
  black: 'var(--mantine-color-black)',
} as const;

// Alpha values for light/dark modes
const LIGHT_ALPHA = 0.1;
const DARK_ALPHA = 0.15;

// Single-color configurations: [colorVar, contrastColor]
const SINGLE_COLOR_CONFIGS: Array<[string, string, string]> = [
  ['primary', COLORS.primary, COLORS.white],
  ['primaryAlt', COLORS.primaryAlt, COLORS.white],
  ['primaryLight', COLORS.primaryLight, COLORS.white],
  ['secondary', COLORS.secondary, COLORS.white],
  ['border', COLORS.border, COLORS.white],
  ['success', COLORS.success, COLORS.white],
  ['error', COLORS.error, COLORS.white],
  ['warning', COLORS.warning, COLORS.black],
];

interface FullTupleConfig {
  text: string;
  filled: string;
  light: string;
  lightColor: string;
  outline: string;
  outlineHoverBase: string;
}

// Generate CSS variables for a single-color tuple
function generateSingleColorVars(
  name: string,
  color: string,
  lightAlpha: number
): Record<string, string> {
  return {
    [`--mantine-color-${name}-text`]: color,
    [`--mantine-color-${name}-filled`]: color,
    [`--mantine-color-${name}-filled-hover`]: alpha(color, 0.9),
    [`--mantine-color-${name}-light`]: alpha(color, lightAlpha),
    [`--mantine-color-${name}-light-hover`]: alpha(
      `var(--mantine-color-${name}-light)`,
      0.8
    ),
    [`--mantine-color-${name}-light-color`]: color,
    [`--mantine-color-${name}-outline`]: color,
    [`--mantine-color-${name}-outline-hover`]: alpha(color, lightAlpha),
  };
}

// Generate CSS variables for a full tuple with distinct shades
function generateFullTupleVars(
  name: string,
  config: FullTupleConfig,
  lightAlpha: number
): Record<string, string> {
  return {
    [`--mantine-color-${name}-text`]: config.text,
    [`--mantine-color-${name}-filled`]: config.filled,
    [`--mantine-color-${name}-filled-hover`]: alpha(config.filled, 0.9),
    [`--mantine-color-${name}-light`]: alpha(config.light, lightAlpha),
    [`--mantine-color-${name}-light-hover`]: alpha(
      `var(--mantine-color-${name}-light)`,
      0.8
    ),
    [`--mantine-color-${name}-light-color`]: config.lightColor,
    [`--mantine-color-${name}-outline`]: config.outline,
    [`--mantine-color-${name}-outline-hover`]: alpha(
      config.outlineHoverBase,
      lightAlpha
    ),
  };
}

// Generate all single-color variables for a given alpha
function generateAllSingleColorVars(
  lightAlpha: number
): Record<string, string> {
  return SINGLE_COLOR_CONFIGS.reduce(
    (acc, [name, color]) => ({
      ...acc,
      ...generateSingleColorVars(name, color, lightAlpha),
    }),
    {}
  );
}

// Generate contrast colors for all single-color tuples
function generateContrastColors(): Record<string, string> {
  return SINGLE_COLOR_CONFIGS.reduce(
    (acc, [name, , contrast]) => ({
      ...acc,
      [`--mantine-color-${name}-contrast`]: contrast,
    }),
    {}
  );
}

const SHARED_VARIABLES = {
  '--mantine-heading-font-weight': '600',
};

const LIGHT_GRAY_CONFIG: FullTupleConfig = {
  text: COLORS.white,
  filled: 'var(--mantine-color-gray-8)',
  light: 'var(--mantine-color-gray-4)',
  lightColor: 'var(--mantine-color-gray-6)',
  outline: 'var(--mantine-color-gray-8)',
  outlineHoverBase: 'var(--mantine-color-gray-4)',
};

const LIGHT_NEUTRAL_CONFIG: FullTupleConfig = {
  text: COLORS.white,
  filled: 'var(--mantine-color-neutral-8)',
  light: 'var(--mantine-color-neutral-4)',
  lightColor: 'var(--mantine-color-neutral-6)',
  outline: 'var(--mantine-color-neutral-8)',
  outlineHoverBase: 'var(--mantine-color-neutral-4)',
};

const DARK_GRAY_CONFIG: FullTupleConfig = {
  text: 'var(--mantine-color-gray-8)',
  filled: 'var(--mantine-color-gray-0)',
  light: 'var(--mantine-color-gray-4)',
  lightColor: 'var(--mantine-color-gray-3)',
  outline: 'var(--mantine-color-gray-0)',
  outlineHoverBase: 'var(--mantine-color-gray-4)',
};

const DARK_NEUTRAL_CONFIG: FullTupleConfig = {
  text: 'var(--mantine-color-neutral-8)',
  filled: 'var(--mantine-color-neutral-0)',
  light: 'var(--mantine-color-neutral-4)',
  lightColor: 'var(--mantine-color-neutral-3)',
  outline: 'var(--mantine-color-neutral-0)',
  outlineHoverBase: 'var(--mantine-color-neutral-4)',
};

const LIGHT_VARIABLES = {
  // Global theme variables
  '--mantine-primary-color-contrast': COLORS.white,
  '--mantine-color-text': COLORS.secondary,
  '--mantine-color-body': COLORS.white,
  '--mantine-color-error': COLORS.error,
  '--mantine-color-placeholder': COLORS.secondary,
  '--mantine-color-anchor': COLORS.secondary,

  // Default surface colors
  '--mantine-color-default': COLORS.white,
  '--mantine-color-default-hover': 'var(--mantine-color-gray-1)',
  '--mantine-color-default-color': COLORS.secondary,
  '--mantine-color-default-border': 'var(--mantine-color-gray-2)',
  '--mantine-color-dimmed': 'var(--mantine-color-gray-10)',

  // Single-color tuples
  ...generateAllSingleColorVars(LIGHT_ALPHA),

  // Full tuples (gray, neutral)
  ...generateFullTupleVars('gray', LIGHT_GRAY_CONFIG, LIGHT_ALPHA),
  ...generateFullTupleVars('neutral', LIGHT_NEUTRAL_CONFIG, LIGHT_ALPHA),

  // Contrast colors
  ...generateContrastColors(),
  '--mantine-color-gray-contrast': 'var(--mantine-color-gray-0)',
  '--mantine-color-neutral-contrast': 'var(--mantine-color-neutral-0)',
};

const DARK_VARIABLES = {
  // Global theme variables
  '--mantine-primary-color-contrast': COLORS.white,
  '--mantine-color-text': COLORS.white,
  '--mantine-color-body': COLORS.black,
  '--mantine-color-error': COLORS.error,
  '--mantine-color-placeholder': 'var(--mantine-color-gray-4)',
  '--mantine-color-anchor': COLORS.white,

  // Default surface colors
  '--mantine-color-default': 'var(--mantine-color-gray-9)',
  '--mantine-color-default-hover': 'var(--mantine-color-gray-7)',
  '--mantine-color-default-color': 'var(--mantine-color-gray-1)',
  '--mantine-color-default-border': 'var(--mantine-color-gray-7)',
  '--mantine-color-dimmed': 'var(--mantine-color-gray-4)',

  // Single-color tuples
  ...generateAllSingleColorVars(DARK_ALPHA),
  // Override secondary light-color for dark mode
  '--mantine-color-secondary-light-color': COLORS.white,

  // Full tuples (gray, neutral)
  ...generateFullTupleVars('gray', DARK_GRAY_CONFIG, DARK_ALPHA),
  ...generateFullTupleVars('neutral', DARK_NEUTRAL_CONFIG, DARK_ALPHA),

  // Contrast colors
  ...generateContrastColors(),
  '--mantine-color-gray-contrast': 'var(--mantine-color-gray-8)',
  '--mantine-color-neutral-contrast': 'var(--mantine-color-neutral-8)',
};

export const cssVariableResolver: CSSVariablesResolver = () => ({
  variables: SHARED_VARIABLES,
  light: LIGHT_VARIABLES,
  dark: DARK_VARIABLES,
});
