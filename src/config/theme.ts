import {
  ActionIcon,
  Alert,
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Blockquote,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  createTheme,
  Dialog,
  Indicator,
  colorsTuple,
  type MantineColorsTuple,
  type MantineThemeOverride,
  Mark,
  NavLink,
  Pagination,
  Paper,
  Radio,
  rem,
  SegmentedControl,
  Select,
  Stepper,
  Switch,
  ThemeIcon,
  Timeline,
  Tooltip,
} from '@mantine/core';

const grayColors: MantineColorsTuple = [
  '#f9fafb',
  '#f3f4f6',
  '#e5e7eb',
  '#d1d5db',
  '#9ca3af',
  '#4b5563',
  '#374151',
  '#1f2937',
  '#111827',
  '#030712',
  '#6B7280',
];
const neutralColors: MantineColorsTuple = [
  '#fafafa',
  '#f5f5f5',
  '#e5e5e5',
  '#d4d4d4',
  '#a3a3a3',
  '#525252',
  '#404040',
  '#262626',
  '#171717',
  '#0a0a0a',
  '#737373',
];

const themeColors = {
  primary: colorsTuple('#5046FF'),
  primaryAlt: colorsTuple('#4F46E5'),
  primaryLight: colorsTuple('#8179FF'),
  secondary: colorsTuple('#1F2937'),
  border: colorsTuple('#454655'),
  success: colorsTuple('#42C873'),
  error: colorsTuple('#FE637A'),
  warning: colorsTuple('#F59E0B'),
  surface: colorsTuple('#1A212B'),
  gray: grayColors,
  neutral: neutralColors,
} as const;

const THEME_COLOR_KEYS = new Set(Object.keys(themeColors));

const NEUTRAL_COLORS = new Set(['gray', 'neutral']);

const getValidColorKey = (color: string | undefined): string | undefined =>
  color && THEME_COLOR_KEYS.has(color) ? color : undefined;

const isNeutralColorKey = (color: string | undefined): boolean =>
  !!color && NEUTRAL_COLORS.has(color);

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem('200px'),
  xs: rem('300px'),
  sm: rem('400px'),
  md: rem('500px'),
  lg: rem('600px'),
  xl: rem('1116px'),
  xxl: rem('1400px'),
  xxxl: rem('1600px'),
};

export const theme: MantineThemeOverride = createTheme({
  fontFamily:
    'Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  colors: themeColors,
  white: '#FFFFFF',
  black: '#000000',
  focusRing: 'never',
  scale: 1,
  primaryColor: 'primary',
  primaryShade: { light: 4, dark: 4 },
  autoContrast: true,
  luminanceThreshold: 0.3,
  radius: {
    xs: rem('6px'),
    sm: rem('8px'),
    md: rem('12px'),
    lg: rem('16px'),
    xl: rem('24px'),
    full: rem('9999px'),
  },
  defaultRadius: 'sm',
  spacing: {
    '4xs': rem('2px'),
    '3xs': rem('4px'),
    '2xs': rem('8px'),
    xs: rem('10px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('20px'),
    xl: rem('24px'),
    '2xl': rem('28px'),
    '3xl': rem('32px'),
    '4xl': rem('40px'),
  },
  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('16px'),
    lg: rem('18px'),
    xl: rem('20px'),
    '2xl': rem('24px'),
    '3xl': rem('30px'),
    '4xl': rem('36px'),
    '5xl': rem('48px'),
  },
  lineHeights: {
    xs: rem('18px'),
    sm: rem('20px'),
    md: rem('24px'),
    lg: rem('28px'),
  },

  headings: {
    sizes: {
      h1: {
        fontSize: rem('36px'),
        lineHeight: rem('44px'),
        fontWeight: '600',
      },
      h2: {
        fontSize: rem('30px'),
        lineHeight: rem('38px'),
        fontWeight: '600',
      },
      h3: {
        fontSize: rem('24px'),
        lineHeight: rem('32px'),
        fontWeight: '600',
      },
      h4: {
        fontSize: rem('20px'),
        lineHeight: rem('30px'),
        fontWeight: '600',
      },
    },
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    xxl: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },

  cursorType: 'pointer',
  components: {
    AppShell: AppShell.extend({
      styles: {
        root: {
          '--app-shell-border-color': 'var(--mantine-color-default-border)',
        },
      },
    }),
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size),
        },
      }),
    }),
    Checkbox: Checkbox.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--checkbox-color': colorKey
              ? `var(--mantine-color-${colorKey}-filled)`
              : 'var(--mantine-primary-color-filled)',

            '--checkbox-icon-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : 'var(--mantine-primary-color-contrast)',
          },
        };
      },
    }),
    Chip: Chip.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        const variant = props.variant ?? 'filled';
        return {
          root: {
            '--chip-bg':
              variant !== 'light'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-filled)`
                  : 'var(--mantine-primary-color-filled)'
                : undefined,
            '--chip-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : undefined,
          },
        };
      },
    }),
    Radio: Radio.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--radio-color': colorKey
              ? `var(--mantine-color-${colorKey}-filled)`
              : (props.color ?? 'var(--mantine-primary-color-filled)'),

            '--radio-icon-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : (props.color ?? 'var(--mantine-primary-color-contrast)'),
          },
        };
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--sc-color': colorKey
              ? isNeutralColorKey(colorKey)
                ? 'var(--mantine-color-body)'
                : `var(--mantine-color-${colorKey}-filled)`
              : (props.color ?? 'var(--mantine-color-default)'),
          },
        };
      },
    }),
    Switch: Switch.extend({
      styles: () => ({
        thumb: {
          backgroundColor: 'var(--mantine-color-default)',
          borderColor: 'var(--mantine-color-default-border)',
        },
        track: {
          borderColor: 'var(--mantine-color-default-border)',
        },
      }),
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right',
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        radius: 'full',
      },
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'filled';

        return {
          root: {
            '--ai-color': (() => {
              if (variant === 'filled') {
                return colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)';
              }
              if (variant === 'white' && isNeutral) {
                return 'var(--mantine-color-black)';
              }
              return undefined;
            })(),
          },
        };
      },
    }),
    Button: Button.extend({
      defaultProps: {
        radius: 'full',
      },
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'filled';
        return {
          root: {
            '--button-color': (() => {
              if (variant === 'filled') {
                return colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)';
              }
              if (variant === 'white' && isNeutral) {
                return 'var(--mantine-color-black)';
              }
              return undefined;
            })(),
          },
        };
      },
    }),
    Anchor: Anchor.extend({
      defaultProps: {
        underline: 'always',
      },
    }),
    NavLink: NavLink.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        const variant = props.variant ?? 'light';
        return {
          root: {
            '--nl-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : undefined,
          },
          children: {},
        };
      },
    }),
    Pagination: Pagination.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--pagination-active-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : 'var(--mantine-primary-color-contrast)',
          },
        };
      },
    }),
    Stepper: Stepper.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--stepper-icon-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : 'var(--mantine-primary-color-contrast)',
          },
        };
      },
    }),
    Alert: Alert.extend({
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'light';
        return {
          root: {
            '--alert-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : variant === 'white' && isNeutral
                  ? 'var(--mantine-color-black)'
                  : undefined,
          },
        };
      },
    }),
    Dialog: Dialog.extend({
      defaultProps: {
        withBorder: true,
      },
    }),
    Tooltip: Tooltip.extend({
      vars: () => ({
        tooltip: {
          '--tooltip-bg': 'var(--mantine-primary-color-filled)',
          '--tooltip-color': 'var(--mantine-primary-color-contrast)',
        },
      }),
    }),
    Avatar: Avatar.extend({
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'light';
        return {
          root: {
            '--avatar-bg':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-filled)`
                  : 'var(--mantine-primary-color-filled)'
                : variant === 'light'
                  ? colorKey
                    ? `var(--mantine-color-${colorKey}-light)`
                    : 'var(--mantine-primary-color-light)'
                  : undefined,

            '--avatar-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : variant === 'light'
                  ? colorKey
                    ? `var(--mantine-color-${colorKey}-light-color)`
                    : 'var(--mantine-primary-color-light-color)'
                  : variant === 'white'
                    ? isNeutral
                      ? 'var(--mantine-color-black)'
                      : colorKey
                        ? `var(--mantine-color-${colorKey}-outline)`
                        : 'var(--mantine-primary-color-filled)'
                    : variant === 'outline' || variant === 'transparent'
                      ? colorKey
                        ? `var(--mantine-color-${colorKey}-outline)`
                        : 'var(--mantine-primary-color-filled)'
                      : undefined,

            '--avatar-bd':
              variant === 'outline'
                ? colorKey
                  ? `1px solid var(--mantine-color-${colorKey}-outline)`
                  : '1px solid var(--mantine-primary-color-filled)'
                : undefined,
          },
        };
      },
    }),
    Badge: Badge.extend({
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'filled';
        return {
          root: {
            '--badge-bg':
              variant === 'filled' && colorKey
                ? `var(--mantine-color-${colorKey}-filled)`
                : undefined,
            '--badge-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : variant === 'white' && isNeutral
                  ? 'var(--mantine-color-black)'
                  : undefined,
          },
        };
      },
    }),
    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'xl',
        withBorder: true,
      },
      styles: (theme) => {
        return {
          root: {
            backgroundColor:
              theme.primaryColor === 'rose' || theme.primaryColor === 'green'
                ? 'var(--mantine-color-secondary-filled)'
                : undefined,
          },
        };
      },
    }),
    Indicator: Indicator.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--indicator-text-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : 'var(--mantine-primary-color-contrast)',
          },
        };
      },
    }),
    ThemeIcon: ThemeIcon.extend({
      vars: (theme, props) => {
        const colorKey = getValidColorKey(props.color);
        const isNeutral =
          isNeutralColorKey(colorKey) ||
          (!colorKey && isNeutralColorKey(theme.primaryColor));
        const variant = props.variant ?? 'filled';
        return {
          root: {
            '--ti-color':
              variant === 'filled'
                ? colorKey
                  ? `var(--mantine-color-${colorKey}-contrast)`
                  : 'var(--mantine-primary-color-contrast)'
                : variant === 'white' && isNeutral
                  ? 'var(--mantine-color-black)'
                  : undefined,
          },
        };
      },
    }),
    Timeline: Timeline.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--tl-icon-color': colorKey
              ? `var(--mantine-color-${colorKey}-contrast)`
              : 'var(--mantine-primary-color-contrast)',
          },
        };
      },
    }),
    Blockquote: Blockquote.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color);
        return {
          root: {
            '--bq-bg-dark': colorKey
              ? `var(--mantine-color-${colorKey}-light)`
              : 'var(--mantine-primary-color-light)',
            '--bq-bg-light': colorKey
              ? `var(--mantine-color-${colorKey}-light)`
              : 'var(--mantine-primary-color-light)',
          },
        };
      },
    }),
    Mark: Mark.extend({
      vars: (_, props) => {
        const colorKey = getValidColorKey(props.color) ?? 'warning';
        return {
          root: {
            '--mark-bg-light': `var(--mantine-color-${colorKey}-${isNeutralColorKey(colorKey) ? '3' : 'filled-hover'})`,
            '--mark-bg-dark': `var(--mantine-color-${colorKey}-filled)`,
          },
        };
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        shadow: 'xl',
      },
    }),
  },
});
