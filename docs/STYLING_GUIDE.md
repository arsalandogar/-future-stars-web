# Styling Guide: Tailwind + Mantine

This project uses **Tailwind CSS v4** with **Mantine v7** via [tailwind-preset-mantine](https://github.com/songkeys/tailwind-preset-mantine).

## Setup

```bash
npm install tailwind-preset-mantine
```

```css
/* src/index.css */
@import 'tailwind-preset-mantine';
```

This maps Tailwind utilities to Mantine's CSS variables:

- `bg-red-5` → `var(--mantine-color-red-5)`
- `text-sm` → `var(--mantine-font-size-sm)`
- `p-md` → `var(--mantine-spacing-md)`

## Decision Matrix

| Scenario                                       | Approach            |
| ---------------------------------------------- | ------------------- |
| Layout (flex, grid, positioning)               | Tailwind            |
| Spacing between components                     | Tailwind            |
| Component appearance (color, size, variant)    | Mantine props       |
| Small tweaks (1-4 properties)                  | Mantine style props |
| State-based styling (disabled, loading, error) | CSS Modules         |
| Complex hover/focus combinations               | CSS Modules         |
| 5+ style modifications                         | CSS Modules         |

## Tailwind: When to Use

### Layout and Spacing

```tsx
<div className="flex items-center justify-between gap-4 p-6">
  <Stack className="flex-1">
    <Title>Dashboard</Title>
  </Stack>
  <Button>Action</Button>
</div>
```

### Styling via classNames Prop

Target inner elements with Tailwind classes:

```tsx
<TextInput
  classNames={{
    root: 'mb-4',
    input: 'bg-gray-1 border-gray-3',
    label: 'font-medium',
  }}
/>
```

### Quick Overrides

```tsx
<Card className="shadow-lg rounded-xl">
  <Text className="line-clamp-2">Long text...</Text>
</Card>
```

## Mantine Props: When to Use

### Component Props (Preferred)

These control multiple CSS properties and respect the theme:

```tsx
<Button color="blue" variant="filled" size="md" radius="lg">
  Click me
</Button>

<TextInput
  label="Email"
  error="Invalid email"  // Automatically styles input border red
  disabled              // Automatically applies disabled styles
/>
```

### Style Props (1-4 Properties)

```tsx
<Text c="dimmed" fz="sm">Secondary text</Text>
<Box mt="lg" p="md">Content</Box>
<Group gap="xs">...</Group>
```

## CSS Modules: When to Use

### 1. State-Based Styling with `data-*` Attributes

Mantine's core principle: **"One class with shared styles, `data-*` attributes as modifiers."**

Components expose state via data attributes:

- `data-disabled` - disabled state
- `data-loading` - loading state
- `data-checked` - checkbox/switch checked
- `data-error` - validation error
- `data-active` - active/selected state
- `data-position="left|right"` - positioned elements

```css
/* button.module.css */
.button {
  background: var(--mantine-color-blue-6);

  &[data-disabled] {
    background: var(--mantine-color-gray-4);
    cursor: not-allowed;
  }

  &[data-loading] {
    background: var(--mantine-color-blue-4);
  }
}
```

```tsx
import classes from './button.module.css';

<Button classNames={{ root: classes.button }}>Submit</Button>;
```

**Why not Tailwind?** While `data-[disabled]:bg-gray-4` works, it gets verbose:

```tsx
// Awkward with multiple states
<Button className="bg-blue-6 data-[disabled]:bg-gray-4 data-[disabled]:cursor-not-allowed data-[loading]:bg-blue-4">
```

### 2. Complex Pseudo-Class Combinations

```css
/* input.module.css */
.input {
  border: 1px solid var(--mantine-color-gray-4);
  transition: all 150ms ease;

  &:focus {
    border-color: var(--mantine-color-blue-6);
    box-shadow: 0 0 0 2px var(--mantine-color-blue-1);
  }

  &[data-error] {
    border-color: var(--mantine-color-red-6);

    &:focus {
      box-shadow: 0 0 0 2px var(--mantine-color-red-1);
    }
  }

  &[data-disabled] {
    background: var(--mantine-color-gray-1);

    &[data-error] {
      background: var(--mantine-color-red-0);
    }
  }
}
```

### 3. Five or More Style Modifications

Extract to CSS module for maintainability:

```css
/* feature-card.module.css */
.card {
  padding: var(--mantine-spacing-lg);
  background: var(--mantine-color-body);
  border: 1px solid var(--mantine-color-gray-3);
  border-radius: var(--mantine-radius-md);
  box-shadow: var(--mantine-shadow-sm);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--mantine-shadow-md);
  }
}

.cardTitle {
  font-size: var(--mantine-font-size-lg);
  font-weight: 600;
  margin-bottom: var(--mantine-spacing-xs);
}
```

```tsx
import classes from './feature-card.module.css';

<Card className={classes.card}>
  <Text className={classes.cardTitle}>Feature</Text>
</Card>;
```

## Mantine CSS Variables Reference

Always use Mantine variables in CSS modules for theme consistency:

```css
.element {
  /* Colors */
  color: var(--mantine-color-text);
  background: var(--mantine-color-body);
  border-color: var(--mantine-color-gray-4);

  /* Theme colors with shades 0-9 */
  color: var(--mantine-color-blue-6);
  background: var(--mantine-color-red-1);

  /* Spacing: xs, sm, md, lg, xl */
  padding: var(--mantine-spacing-md);
  gap: var(--mantine-spacing-sm);

  /* Typography */
  font-size: var(--mantine-font-size-sm);
  font-family: var(--mantine-font-family);
  line-height: var(--mantine-line-height);

  /* Radius: xs, sm, md, lg, xl */
  border-radius: var(--mantine-radius-md);

  /* Shadows: xs, sm, md, lg, xl */
  box-shadow: var(--mantine-shadow-sm);
}
```

## Styles API: Targeting Inner Elements

Every Mantine component exposes selectors for inner elements.

### Via classNames Prop

```tsx
<Accordion
  classNames={{
    root: classes.accordion,
    item: classes.item,
    control: classes.control,
    chevron: classes.chevron,
    panel: classes.panel,
  }}
>
```

### Via Static Selectors (Global CSS)

```css
/* Applies to ALL Accordion components */
.mantine-Accordion-control {
  font-weight: 600;
}

.mantine-Accordion-chevron[data-rotate] {
  transform: rotate(180deg);
}
```

Find selectors in the [Mantine docs](https://mantine.dev) under each component's "Styles API" section.

## Examples

### Custom Button with Loading State

```css
/* submit-button.module.css */
.root {
  min-width: 120px;

  &[data-loading] {
    /* Dim the button while loading */
    opacity: 0.8;
  }
}

.label {
  transition: opacity 150ms ease;

  &[data-loading] {
    opacity: 0;
  }
}
```

```tsx
<Button
  classNames={{ root: classes.root, label: classes.label }}
  loading={isSubmitting}
>
  Submit
</Button>
```

### Form Input with Error Styling

```css
/* form-input.module.css */
.input {
  &[data-error] {
    background: var(--mantine-color-red-0);

    &::placeholder {
      color: var(--mantine-color-red-4);
    }
  }
}

.error {
  font-size: var(--mantine-font-size-xs);
  margin-top: var(--mantine-spacing-xs);
}
```

### Card with Hover Effect

```css
/* clickable-card.module.css */
.card {
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: var(--mantine-color-gray-0);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: inherit;
      transform: none;
    }
  }
}
```

## Summary

1. **Tailwind** → Layout, spacing, quick utility overrides
2. **Mantine props** → Component behavior (color, size, variant, disabled, error)
3. **Mantine style props** → Small tweaks (1-4 properties)
4. **CSS Modules** → State-based styling, complex interactions, 5+ modifications

The key insight: Mantine uses `data-*` attributes for state, which CSS modules handle elegantly but Tailwind handles awkwardly.

## References

- [Mantine Styles Overview](https://mantine.dev/styles/styles-overview/)
- [Mantine CSS Modules](https://mantine.dev/styles/css-modules/)
- [Mantine Styles API](https://mantine.dev/styles/styles-api/)
- [Mantine Data Attributes](https://mantine.dev/styles/data-attributes/)
- [Mantine CSS Variables](https://mantine.dev/styles/css-variables/)
- [tailwind-preset-mantine](https://github.com/songkeys/tailwind-preset-mantine)
