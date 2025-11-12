# Plausible Analytics Design System - Style Guide

Plausible Analytics（plausible.io）のデザインシステムを完全にピクセルパーフェクトで抽出したスタイルガイド。

---

## 📊 デザインの特徴

### デザイン哲学
- **ミニマル & クリーン**: シンプルで無駄のないデザイン
- **ダークモード対応**: Light/Dark両モードに完全対応
- **データ重視**: アナリティクスダッシュボードに最適化
- **Tailwind CSS**: ユーティリティファーストのアプローチ

---

## 🎨 カラーパレット

### Primary Colors

#### Indigo (Primary/CTA)
```css
--indigo-400: #818cf8;  /* Hover状態 (Dark mode) */
--indigo-500: #6366f1;  /* Hover状態 (Light mode) */
--indigo-600: #4f46e5;  /* Primary CTA */
--indigo-700: #4338ca;  /* Hover状態 */
```

#### Blue (Accent/Info)
```css
--blue-200: #bfdbfe;    /* Background (Light alerts) */
--blue-900: #1e3a8a;    /* Text (Alerts) */
```

### Grayscale (Light Mode)

```css
--gray-50:  #f9fafb;    /* Background */
--gray-100: #f3f4f6;    /* Light backgrounds */
--gray-200: #e5e7eb;    /* Borders */
--gray-300: #d1d5db;    /* Footer links */
--gray-400: #9ca3af;    /* Muted text */
--gray-500: #6b7280;    /* Secondary text */
--gray-800: #1f2937;    /* Footer background */
--gray-900: #111827;    /* Primary text */
```

### Grayscale (Dark Mode)

```css
--gray-100-dark: #1f2937;  /* Light elements */
--gray-200-dark: #374151;  /* Secondary light */
--gray-800-dark: #374151;  /* Card backgrounds */
--gray-850-dark: #1e293b;  /* Section backgrounds */
--gray-900-dark: #0f172a;  /* Footer dark */
--gray-950-dark: #020617;  /* Body background */
```

### Semantic Colors

```css
--white: #ffffff;       /* Cards, buttons */
--black: #000000;       /* Reserved */
```

---

## 📝 タイポグラフィ

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

システムフォントスタック（高速レンダリング）

### Font Sizes & Line Heights

#### Headings
```css
/* H1 - Hero Title */
.text-3xl {
  font-size: 1.875rem;    /* 30px */
  line-height: 2.25rem;   /* 36px */
}

.text-4xl {
  font-size: 2.25rem;     /* 36px */
  line-height: 2.5rem;    /* 40px */
}

/* H2 - Section Title */
.text-2xl {
  font-size: 1.5rem;      /* 24px */
  line-height: 2rem;      /* 32px */
}

/* H4 - Footer Headings */
.text-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.25rem;   /* 20px */
}
```

#### Body Text
```css
/* Base text */
.text-base {
  font-size: 1rem;        /* 16px */
  line-height: 1.5rem;    /* 24px */
}

/* Small text */
.text-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.25rem;   /* 20px */
}

/* Large text */
.text-lg {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.75rem;   /* 28px */
}
```

### Font Weights

```css
--font-medium: 500;      /* Links, labels */
--font-semibold: 600;    /* Subheadings */
--font-bold: 700;        /* Important text */
--font-extrabold: 800;   /* Hero headings */
```

### Tracking (Letter Spacing)

```css
.tracking-tight {
  letter-spacing: -0.025em;  /* Hero titles */
}

.tracking-wider {
  letter-spacing: 0.05em;    /* Uppercase labels */
}
```

---

## 📐 Spacing System

Plausibleは4pxベースのスペーシングシステム（Tailwind標準）

### Padding/Margin Scale

```css
p-2:  0.5rem;   /* 8px */
p-3:  0.75rem;  /* 12px */
p-4:  1rem;     /* 16px */
p-5:  1.25rem;  /* 20px */
p-6:  1.5rem;   /* 24px */
p-8:  2rem;     /* 32px */
p-12: 3rem;     /* 48px */
p-16: 4rem;     /* 64px */
p-24: 6rem;     /* 96px */
```

### Common Usage

```css
/* Section padding (vertical) */
py-8:  2rem (32px)     /* Small sections */
py-12: 3rem (48px)     /* Medium sections */
py-16: 4rem (64px)     /* Large sections */

/* Container padding (horizontal) */
px-4: 1rem (16px)      /* Mobile */
px-6: 1.5rem (24px)    /* Tablet */
px-8: 2rem (32px)      /* Desktop */
```

---

## 🧱 Layout & Grid

### Container

```css
.container {
  max-width: 1280px;          /* Desktop max */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;         /* 16px mobile */
  padding-right: 1rem;        /* 16px mobile */
}

@media (min-width: 640px) {
  .container {
    padding-left: 1.5rem;     /* 24px tablet */
    padding-right: 1.5rem;    /* 24px tablet */
  }
}
```

### Grid System

```css
/* Footer grid - 3 columns */
.xl\\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* Sub-grid - 2 columns */
.md\\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* Gap */
.gap-8 {
  gap: 2rem; /* 32px */
}
```

---

## 🎯 Components

### Button Styles

#### Primary Button (Indigo CTA)
```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;      /* py-3 px-5 */
  font-size: 1rem;                /* text-base */
  font-weight: 500;               /* font-medium */
  color: #ffffff;
  background-color: #4f46e5;      /* bg-indigo-600 */
  border: 1px solid transparent;
  border-radius: 0.375rem;        /* rounded-md */
  line-height: 1.5rem;            /* leading-6 */
  transition: background-color 150ms ease-in-out;
}

.button-primary:hover {
  background-color: #6366f1;      /* hover:bg-indigo-500 */
}

.button-primary:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5);
}
```

#### Secondary Button (White/Ghost)
```css
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;      /* py-3 px-5 */
  font-size: 1rem;                /* text-base */
  font-weight: 500;               /* font-medium */
  color: #4f46e5;                 /* text-indigo-600 */
  background-color: #ffffff;      /* bg-white */
  border: 1px solid transparent;
  border-radius: 0.375rem;        /* rounded-md */
  line-height: 1.5rem;
  transition: color 150ms ease-in-out;
}

.button-secondary:hover {
  color: #6366f1;                 /* hover:text-indigo-500 */
}

/* Dark mode */
.dark .button-secondary {
  color: #f3f4f6;                 /* dark:text-gray-100 */
  background-color: #1f2937;      /* dark:bg-gray-800 */
}

.dark .button-secondary:hover {
  color: #818cf8;                 /* dark:hover:text-indigo-400 */
}
```

#### Text Link
```css
.link {
  font-weight: 500;               /* font-medium */
  color: #6b7280;                 /* text-gray-500 */
  transition: color 150ms ease-in-out;
}

.link:hover {
  color: #111827;                 /* hover:text-gray-900 */
}

/* Dark mode */
.dark .link {
  color: #e5e7eb;                 /* dark:text-gray-200 */
}

.dark .link:hover {
  color: #f9fafb;                 /* dark:hover:text-white */
}
```

### Navigation

```css
.nav {
  position: relative;
  z-index: 20;
  padding-top: 2rem;              /* py-8 */
  padding-bottom: 2rem;           /* py-8 */
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 2.5rem;                 /* h-10 */
}

.logo {
  width: 8rem;                    /* w-32 (128px) */
}
```

### Footer

```css
.footer {
  background-color: #1f2937;      /* bg-gray-800 */
  margin-top: 6rem;               /* mt-24 */
}

/* Dark mode */
.dark .footer {
  background-color: #0f172a;      /* dark:bg-gray-900 */
}

.footer-container {
  padding: 3rem 1rem;             /* py-12 px-4 */
}

.footer-title {
  font-size: 0.875rem;            /* text-sm */
  font-weight: 600;               /* font-semibold */
  letter-spacing: 0.05em;         /* tracking-wider */
  text-transform: uppercase;
  color: #9ca3af;                 /* text-gray-400 */
  line-height: 1.25rem;           /* leading-5 */
}

.footer-link {
  font-size: 1rem;                /* text-base */
  color: #d1d5db;                 /* text-gray-300 */
  line-height: 1.5rem;            /* leading-6 */
  transition: color 150ms ease-in-out;
}

.footer-link:hover {
  color: #ffffff;                 /* hover:text-white */
}
```

### Alert/Banner

```css
.alert {
  width: 100%;
  padding: 1rem;                  /* px-4 */
  font-size: 0.875rem;            /* text-sm */
  font-weight: 700;               /* font-bold */
  text-align: center;
  background-color: #bfdbfe;      /* bg-blue-200 */
  color: #1e3a8a;                 /* text-blue-900 */
  border-radius: 0.125rem;        /* rounded-sm */
  transition: all 150ms ease;
}
```

### Card/Section

```css
.section {
  background-color: #f9fafb;      /* bg-gray-50 */
}

/* Dark mode */
.dark .section {
  background-color: #1e293b;      /* dark:bg-gray-850 */
}

.section-inner {
  padding: 3rem 0;                /* py-12 */
}

@media (min-width: 1024px) {
  .section-inner {
    padding: 4rem 0;              /* lg:py-16 */
  }
}
```

---

## 🌓 Dark Mode

### Implementation

```html
<html class="dark">
  <body class="bg-gray-50 dark:bg-gray-950">
    <!-- Content -->
  </body>
</html>
```

### Dark Mode Color Mapping

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Body Background | `bg-gray-50` (#f9fafb) | `bg-gray-950` (#020617) |
| Text Primary | `text-gray-900` (#111827) | `text-gray-100` (#f3f4f6) |
| Text Secondary | `text-gray-500` (#6b7280) | `text-gray-200` (#e5e7eb) |
| Link | `text-gray-500` | `text-gray-200` |
| Link Hover | `text-gray-900` | `text-white` |
| Button Secondary BG | `bg-white` | `bg-gray-800` |
| Section BG | `bg-gray-50` | `bg-gray-850` |
| Footer BG | `bg-gray-800` | `bg-gray-900` |

---

## 🎭 Shadows & Effects

### Box Shadow

```css
/* Small shadow */
.shadow-xs {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Default shadow */
.shadow-sm {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
              0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
```

### Border Radius

```css
--radius-sm: 0.125rem;  /* 2px - rounded-sm */
--radius-md: 0.375rem;  /* 6px - rounded-md */
```

### Transitions

```css
.transition {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-150 {
  transition-duration: 150ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
sm:  640px   /* Tablet */
md:  768px   /* Small desktop */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Usage Example

```css
/* Mobile-first approach */
.hero-title {
  font-size: 1.875rem;  /* text-3xl (30px) mobile */
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 2.25rem; /* sm:text-4xl (36px) desktop */
    line-height: 2.5rem;/* sm:leading-10 */
  }
}
```

---

## 🎨 Usage Examples

### Hero Section

```html
<div class="bg-gray-50 dark:bg-gray-850">
  <div class="py-12 lg:py-16 lg:flex lg:items-center lg:justify-between">
    <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 leading-9 sm:text-4xl sm:leading-10 dark:text-gray-100">
      Want these stats for your website? <br>
      <span class="text-indigo-600">Start your free trial today.</span>
    </h2>
    <div class="flex mt-8 lg:shrink-0 lg:mt-0">
      <div class="inline-flex shadow-sm rounded-md">
        <a href="/register" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out">
          Get started
        </a>
      </div>
      <div class="inline-flex ml-3 shadow-xs rounded-md">
        <a href="/" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent leading-6 rounded-md dark:text-gray-100 dark:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out">
          Learn more
        </a>
      </div>
    </div>
  </div>
</div>
```

### Navigation Bar

```html
<nav class="relative z-20 py-8">
  <div class="container">
    <nav class="relative flex items-center justify-between sm:h-10 md:justify-center">
      <div class="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
        <a href="/">
          <img src="/logo_dark.svg" class="w-32 hidden dark:inline" alt="Logo">
          <img src="/logo_light.svg" class="w-32 inline dark:hidden" alt="Logo">
        </a>
      </div>
      <div class="absolute inset-y-0 right-0 flex items-center justify-end">
        <ul class="flex">
          <li>
            <a href="/login" class="font-medium text-gray-500 dark:text-gray-200 hover:text-gray-900 focus:outline-hidden focus:text-gray-900 transition duration-150 ease-in-out">
              Login
            </a>
          </li>
          <li class="ml-6">
            <a href="/register" class="inline-flex items-center justify-center px-5 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out">
              Sign up
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</nav>
```

---

## 💡 Design Principles

1. **シンプル第一**: 不要な装飾を避け、機能性を重視
2. **ダークモード**: すべてのコンポーネントがライト・ダークモード対応
3. **アクセシビリティ**: 十分なコントラスト比とフォーカス状態
4. **パフォーマンス**: システムフォント、最小限のアニメーション
5. **一貫性**: Tailwind CSSによる統一されたデザイン言語

---

## 📦 使用方法

1. このスタイルガイドとデザイントークンファイル（`plausible-design-tokens.css`）を使用
2. Tailwind CSSの設定をPlausibleのカスタムカラーで拡張
3. ダークモードは `class="dark"` をHTMLタグに追加して有効化

---

**抽出日**: 2025-01-11
**バージョン**: 1.0.0
**ライセンス**: 教育目的での使用
**出典**: plausible.io (Live Demo page)
