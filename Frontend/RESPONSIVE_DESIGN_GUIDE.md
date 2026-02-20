# Responsive Design Guide

## Font Size Strategy

### Root Font Size (Base 16px = 1rem)
The application uses **dynamic root font size** based on screen width:

- **Screens ≤ 480px**: `12px` base (0.75rem equivalent)
- **Screens 480px - 1600px**: `14px` base (0.875rem equivalent)  ← **DEFAULT**
- **Screens > 1600px**: `16px` base (1rem equivalent)

This means all `rem` values automatically scale based on screen size!

## Breakpoints Strategy

| Screen Size | Device Type | Use Case |
|------------|-------------|----------|
| < 480px | Mobile (extra small) | Small phones |
| 480px - 576px | Mobile (small) | Most modern phones |
| 576px - 768px | Mobile/Tablet | Large phones, small tablets |
| 768px - 992px | Tablet | Medium tablets |
| 992px - 1200px | Tablet/Desktop | Large tablets, small desktops |
| 1200px - 1600px | Desktop | Standard desktops |
| > 1600px | Desktop (ultra-wide) | Large monitors, 4K screens |

## REM Conversion Reference

### Spacing
```css
4px   = 0.25rem
6px   = 0.375rem
8px   = 0.5rem
12px  = 0.75rem
16px  = 1rem      /* BASE */
20px  = 1.25rem
24px  = 1.5rem
32px  = 2rem
40px  = 2.5rem
48px  = 3rem
```

### Font Sizes
```css
12px  = 0.75rem   /* Extra small text */
14px  = 0.875rem  /* Small text (default form labels) */
16px  = 1rem      /* Base/Body text */
18px  = 1.125rem  /* Large text */
20px  = 1.25rem   /* XL text */
24px  = 1.5rem    /* 2XL text */
30px  = 1.875rem  /* 3XL text */
36px  = 2.25rem   /* 4XL text */
```

### Borders & Shadows
```css
1px   = 0.0625rem
2px   = 0.125rem
3px   = 0.1875rem
4px   = 0.25rem
```

## CSS Variables

All design tokens are defined in `index.css` `:root`:

```css
/* Colors */
--primary: #007bff
--success: #28a745
--danger: #dc3545
--warning: #ffc107
--info: #17a2b8

/* Spacing - uses rem */
--sp-4: 0.25rem
--sp-8: 0.5rem
--sp-16: 1rem
--sp-24: 1.5rem
--sp-32: 2rem

/* Font sizes - uses rem */
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem

/* Shadows, Radius, Transitions, Z-index */
```

## Usage Examples

### Example 1: Responsive Heading
```jsx
<h1>My Title</h1>
/* Automatically scales:
   - 12px base on mobile (<480px)
   - 14px base on tablets (480px-1600px)
   - 16px base on desktops (>1600px)
   - h1 = 2.25rem = 27px/39.2px/36px respectively
*/
```

### Example 2: Responsive Button
```jsx
<Button size="md">Click Me</Button>
/* Button CSS:
   .btn-md {
     padding: 0.625rem 1rem;  // scales with root font
     font-size: 0.875rem;     // scales with root font
   }
   
   Results:
   - Mobile: padding 7.5px-12px, font 10.5px
   - Tablet: padding 8.75px-14px, font 12.25px
   - Desktop: padding 10px-16px, font 14px
*/
```

### Example 3: Responsive Container
```jsx
<div className="container">
  <p>Content</p>
</div>
/* Widths:
   - < 480px: 100% (12px padding)
   - 576px: 540px (14px padding)
   - 768px: 720px (20px padding)
   - 992px: 960px
   - 1200px: 1140px
   - 1400px: 1320px
   - 1600px: 1500px
*/
```

## Utility Classes

### Display & Flexbox
```html
<div class="flex items-center justify-between gap-4">
  <!-- Responsive flexbox -->
</div>
```

### Spacing
```html
<div class="p-4 mt-6 mb-4">
  <!-- padding: 1rem, margin-top: 1.5rem, margin-bottom: 1rem -->
</div>
```

### Text
```html
<p class="text-lg font-semibold text-primary">
  <!-- 1.125rem font-size, 600 font-weight, #007bff color -->
</p>
```

### Responsive Visibility
```html
<div class="hidden-xs">Only visible on tablets+</div>
<div class="hidden-md">Only visible on mobile or desktop</div>
```

## Mobile-First Approach

The CSS is written mobile-first:
1. Base styles for mobile
2. `@media (min-width: 576px)` for tablets
3. `@media (min-width: 992px)` for desktops
4. `@media (min-width: 1600px)` for ultra-wide

## Testing Responsiveness

### Common Screen Sizes to Test:
- **Mobile**: 375px, 414px (iPhone)
- **Tablet**: 768px, 834px (iPad)
- **Desktop**: 1024px, 1366px (laptop)
- **Ultra-wide**: 1920px, 2560px (monitors)

### Browser Dev Tools:
- Chrome: `F12` → Toggle device toolbar (`Ctrl+Shift+M`)
- Firefox: `F12` → Responsive Design Mode (`Ctrl+Shift+M`)

## Best Practices

1. **Always use `rem`** for measurements - never `px`
2. **Use CSS variables** - don't hardcode colors/sizes
3. **Mobile first** - start styles for mobile, add `@media` for larger screens
4. **Test on devices** - device emulation shows scaling, real devices show exact rendering
5. **Use container queries** (future) - for component-level responsiveness
6. **Avoid magic numbers** - use spacing variables

## Font Size at Different Breakpoints

Let's say you want text that looks good everywhere:

```css
/* Mobile context: base 12px, h1 = 2.25rem = 27px */
h1 { font-size: var(--font-size-4xl); /* 2.25rem */ }

/* Tablet context: base 14px, h1 = 2.25rem = 31.5px */
/* Automatic scaling, no media query needed! */

/* Desktop context: base 16px, h1 = 2.25rem = 36px */
/* Still automatic scaling */
```

## Benefits of This Approach

✅ **One CSS codebase** works on all devices  
✅ **Proportional scaling** - spacing, fonts, everything scales together  
✅ **No media queries** needed for most size changes  
✅ **Easier maintenance** - change root font-size, everything updates  
✅ **Professional UX** - not cramped on mobile, not wasteful on desktop  
✅ **Future-proof** - works with new screen sizes automatically  
