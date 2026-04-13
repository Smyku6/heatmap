

# Tailwind CSS + shadcn/ui Migration Plan

**Project:** Heatmap Application
**Goal:** Migrate from CSS modules to Tailwind CSS + shadcn/ui for enterprise-grade responsive web experience
**Target:** Single responsive web app (mobile + desktop)
**Estimated Duration:** 3-4 weeks
**Risk Level:** Medium

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Migration Phases](#migration-phases)
5. [Component Migration Priority](#component-migration-priority)
6. [Risk Assessment](#risk-assessment)
7. [Rollback Plan](#rollback-plan)
8. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

### Why Migrate?

**Current Issues:**
- 17 separate CSS files to maintain
- Limited responsive design patterns
- No design system/component library
- Manual mobile optimization
- Inconsistent spacing/colors
- No dark mode support

**Benefits of Tailwind + shadcn/ui:**
- ✅ **Smaller Bundle:** Potential 20-30% reduction (26KB → ~18-20KB CSS)
- ✅ **Mobile-First:** Built-in responsive breakpoints
- ✅ **Design System:** Pre-built accessible components
- ✅ **Developer Velocity:** 3x faster styling iteration
- ✅ **Type-Safe:** Tailwind IntelliSense + TypeScript
- ✅ **Dark Mode:** Built-in theme support
- ✅ **Consistency:** Utility classes enforce design tokens
- ✅ **Zero Runtime:** All CSS at build time

### What We're NOT Changing

- ✅ TypeScript setup (stays as-is)
- ✅ Branded types (stays as-is)
- ✅ Discriminated unions (stays as-is)
- ✅ Zustand store (stays as-is)
- ✅ Business logic (tcxParser, pitchDetection, etc.)
- ✅ Vite + React (stays as-is)
- ✅ File structure (minimal changes)

---

## 2. Current State Analysis

### Existing CSS Files

```
src/
├── App.css (2.3 KB)
├── index.css (1.2 KB)
└── components/
    ├── FileSelector.css (1.8 KB)
    ├── FileUpload.css (2.1 KB)
    ├── HeatmapControls.css (1.5 KB)
    ├── HeatmapLayer.css (0.8 KB)
    ├── Layout.css (1.2 KB)
    ├── OrientationSelector.css (1.1 KB)
    ├── PerformanceSelector.css (1.0 KB)
    ├── Pitch.css (3.2 KB)
    ├── PitchInfoBanner.css (1.4 KB)
    ├── PitchSelector.css (0.9 KB)
    ├── SatelliteControls.css (1.3 KB)
    ├── SegmentSelector.css (1.1 KB)
    ├── SessionsTable.css (2.5 KB)
    ├── Sidebar.css (1.0 KB)
    ├── SprintControls.css (1.2 KB)
    └── SquadMaker.css (1.4 KB)

Total: ~26 KB CSS (unminified)
```

### Current Tech Stack

```json
{
  "Framework": "Vite + React 19",
  "Language": "TypeScript 6 (strict mode)",
  "Styling": "CSS Modules + Custom CSS",
  "State": "Zustand 5",
  "Routing": "React Router 7",
  "Icons": "Material Symbols",
  "Build Tool": "Vite 8",
  "Bundle Size": {
    "JS": "288.76 KB (89.68 KB gzipped)",
    "CSS": "26.35 KB (5.15 KB gzipped)"
  }
}
```

### Responsive Design Audit

**Current Responsive Support:** ⚠️ Limited

- ❌ No mobile-specific layouts
- ❌ Fixed breakpoints in some components
- ⚠️ Some components use `@media` queries
- ❌ No touch optimization
- ❌ No progressive disclosure patterns
- ❌ Desktop-first approach

---

## 3. Target Architecture

### New Tech Stack

```json
{
  "Framework": "Vite + React 19",
  "Language": "TypeScript 6 (strict mode)",
  "Styling": "Tailwind CSS 4.0",
  "Component Library": "shadcn/ui (Radix UI primitives)",
  "Icons": "lucide-react",
  "State": "Zustand 5",
  "Routing": "React Router 7",
  "Dark Mode": "next-themes",
  "Forms": "React Hook Form + Zod (optional)",
  "Animations": "Framer Motion (optional)",
  "PWA": "vite-plugin-pwa (optional)"
}
```

### New File Structure

```
src/
├── components/
│   ├── ui/                          # NEW - shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx               # Mobile drawer
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   │
│   ├── FileUpload.tsx              # Refactored
│   ├── FileSelector.tsx            # Refactored
│   ├── SessionsTable.tsx           # Refactored (responsive)
│   ├── Sidebar.tsx                 # Refactored (drawer on mobile)
│   └── ...
│
├── lib/                             # NEW - Utilities
│   ├── utils.ts                    # cn() helper
│   └── constants.ts                # Design tokens
│
├── styles/                          # NEW (optional)
│   └── globals.css                 # Tailwind directives + custom CSS
│
├── types/                           # ✅ No changes
├── store/                           # ✅ No changes
├── utils/                           # ✅ No changes
└── ...

tailwind.config.ts                   # NEW - Tailwind config
components.json                      # NEW - shadcn/ui config
```

### Design System Tokens

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Based on existing app colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',  // Current blue
          900: '#1e3a8a',
        },
        slate: {
          // Current dark backgrounds
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      spacing: {
        // Current spacing patterns
      },
      borderRadius: {
        lg: '0.5rem',     // Current border radius
      }
    }
  }
}
```

---

## 4. Migration Phases

### Phase 0: Preparation & Setup (3-5 days)

#### Tasks:
1. **Install Dependencies**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npm install -D @tailwindcss/forms @tailwindcss/typography
   npm install class-variance-authority clsx tailwind-merge
   npm install lucide-react
   npx tailwindcss init -p
   ```

2. **Setup shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```

3. **Configure Tailwind**
   - Create `tailwind.config.ts`
   - Update `postcss.config.js`
   - Create `src/lib/utils.ts` with `cn()` helper
   - Add Tailwind directives to main CSS

4. **Install Core shadcn/ui Components**
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add dialog
   npx shadcn@latest add sheet
   npx shadcn@latest add table
   npx shadcn@latest add select
   npx shadcn@latest add slider
   ```

5. **Create Branch**
   ```bash
   git checkout -b feature/tailwind-migration
   ```

6. **Setup Dark Mode (Optional)**
   ```bash
   npm install next-themes
   ```

**Success Criteria:**
- ✅ Tailwind builds without errors
- ✅ shadcn/ui components render
- ✅ Existing app still works (CSS coexistence)
- ✅ Hot reload works

**Estimated Time:** 1 day

---

### Phase 1: Core Infrastructure (5-7 days)

#### 1.1 Global Styles Migration

**Files to migrate:**
- `src/index.css`
- `src/App.css`

**Before:**
```css
/* index.css */
:root {
  --color-primary: #3b82f6;
  --color-background: #0f172a;
  --spacing-unit: 8px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--color-background);
  color: white;
}
```

**After:**
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

**Estimated Time:** 1 day

---

#### 1.2 Layout Component Migration

**Priority: HIGH** (affects all pages)

**Component:** `Layout.tsx` + `Sidebar.tsx`

**Current:**
```tsx
// Layout.tsx - Desktop only
<div className="app-layout">
  <Sidebar />
  <main className="main-content">
    {children}
  </main>
</div>
```

**Target:**
```tsx
// Layout.tsx - Responsive with mobile drawer
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Layout({ children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="ml-2 text-lg font-bold">Heatmap</h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

**Responsive Breakpoints:**
- `< 768px` - Mobile drawer
- `>= 768px` - Fixed sidebar

**Estimated Time:** 2 days

---

#### 1.3 Button System Migration

**Create base button component using shadcn/ui**

```tsx
// Already installed via: npx shadcn@latest add button
// Customize variants in components/ui/button.tsx

import { Button } from "@/components/ui/button"

// Usage across app:
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Replace in all components:**
- Replace `<button className="...">` with `<Button>`
- Update event handlers
- Add proper variants

**Estimated Time:** 1 day

---

### Phase 2: File Upload Components (5-7 days)

#### 2.1 FileUpload Component

**Priority: HIGH** (user-facing, frequently used)

**Current:** `FileUpload.tsx` + `FileUpload.css` (220 lines TSX + 136 lines CSS)

**Migration Strategy:**
1. Keep discriminated union state (DragDropUploadState)
2. Replace CSS with Tailwind utilities
3. Add responsive mobile layout
4. Improve touch targets for mobile
5. Add loading animations

**Before:**
```tsx
<div className="upload-zone">
  <div className="upload-zone-background" />
  <div className="upload-zone-content">
    <div className="upload-icon-circle">
      <span className="material-symbols-outlined">speed</span>
    </div>
    <h3 className="upload-title">Wgraj plik TCX</h3>
    <p className="upload-description">...</p>
    <button className="upload-button">Wybierz plik</button>
  </div>
</div>
```

**After:**
```tsx
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

<div className={cn(
  // Base styles
  "relative flex flex-col items-center justify-center",
  "rounded-xl border-2 border-dashed transition-all",

  // Mobile
  "p-6 gap-4 min-h-[250px]",

  // Tablet/Desktop
  "md:p-8 md:gap-6 md:min-h-[350px]",
  "lg:p-12 lg:min-h-[400px]",

  // States
  uploadState.type === 'idle' && "border-slate-700 bg-slate-900/50 hover:border-blue-500 hover:bg-slate-900",
  uploadState.type === 'dragging' && "border-blue-500 bg-blue-500/10",
  uploadState.type === 'uploading' && "border-yellow-500 bg-yellow-500/5",
  uploadState.type === 'error' && "border-red-500 bg-red-500/5",
)}>
  {/* Icon */}
  <div className={cn(
    "rounded-full p-4 md:p-6",
    "bg-slate-800 border-2",
    uploadState.type === 'idle' && "border-slate-700",
    uploadState.type === 'dragging' && "border-blue-500",
  )}>
    {uploadState.type === 'idle' && <Upload className="h-8 w-8 md:h-12 md:w-12" />}
    {uploadState.type === 'uploading' && <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin" />}
    {uploadState.type === 'error' && <AlertCircle className="h-8 w-8 md:h-12 md:w-12 text-red-500" />}
  </div>

  {/* Title */}
  <h3 className="text-lg md:text-xl lg:text-2xl font-bold">
    {uploadState.type === 'idle' && 'Wgraj plik TCX'}
    {uploadState.type === 'uploading' && 'Wczytuję...'}
    {uploadState.type === 'error' && 'Błąd'}
  </h3>

  {/* Description */}
  <p className="text-sm md:text-base text-center text-muted-foreground max-w-md">
    {/* ... */}
  </p>

  {/* Button - touch-friendly on mobile */}
  {uploadState.type === 'idle' && (
    <Button size="lg" className="mt-2 h-12 md:h-10">
      Wybierz plik
    </Button>
  )}

  {/* Progress */}
  {uploadState.type === 'uploading' && uploadState.progress && (
    <div className="w-full max-w-xs">
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${uploadState.progress}%` }}
        />
      </div>
      <p className="text-sm text-center mt-2">{Math.round(uploadState.progress)}%</p>
    </div>
  )}
</div>
```

**Key Improvements:**
- ✅ Responsive sizing (mobile → tablet → desktop)
- ✅ Touch-friendly button (h-12 on mobile)
- ✅ Proper icon library (lucide-react)
- ✅ Smooth animations
- ✅ Better visual hierarchy

**Estimated Time:** 2 days

---

#### 2.2 FileSelector Component

**Priority: HIGH**

**Current:** Uses `FileUploadState` discriminated union

**Migration:** Similar to FileUpload, add responsive grid for example files

**Estimated Time:** 1.5 days

---

### Phase 3: Data Display Components (7-10 days)

#### 3.1 SessionsTable Component

**Priority: CRITICAL** (complex responsive requirements)

**Current:** Desktop table only

**Target:** Adaptive layout
- **Mobile (<768px):** Card grid
- **Desktop (>=768px):** Data table

**Before:**
```tsx
<table className="sessions-table">
  <thead>
    <tr>
      <th>Data</th>
      <th>Boisko</th>
      <th>Czas trwania</th>
      <th>Dystans</th>
      <th>Średnie tętno</th>
      <th>Akcja</th>
    </tr>
  </thead>
  <tbody>
    {sessions.map(session => (
      <tr key={session.id}>
        <td>{formatDate(session.date)}</td>
        {/* ... */}
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Activity, Heart, Route } from "lucide-react"

export function SessionsTable({ sessions }: Props) {
  return (
    <>
      {/* Mobile - Cards */}
      <div className="grid gap-4 md:hidden">
        {sessions.map(session => (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {session.pitchInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDistance(session.distance)} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(session.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{session.avgHeartRate ?? '-'} bpm</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => handleAnalyze(session.id)}>
                <Activity className="mr-2 h-4 w-4" />
                Analizuj
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop - Table */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Boisko</TableHead>
              <TableHead>Czas trwania</TableHead>
              <TableHead>Dystans</TableHead>
              <TableHead>Średnie tętno</TableHead>
              <TableHead className="text-right">Akcja</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell>{formatDate(session.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {session.pitchInfo.name}
                  </div>
                </TableCell>
                <TableCell>{formatDuration(session.duration)}</TableCell>
                <TableCell>{formatDistance(session.distance)} km</TableCell>
                <TableCell>{session.avgHeartRate ?? '-'} bpm</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleAnalyze(session.id)}>
                    <Activity className="mr-2 h-4 w-4" />
                    Analizuj
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
```

**Key Features:**
- ✅ Progressive disclosure (cards → table)
- ✅ Touch-friendly buttons on mobile
- ✅ Consistent icon usage
- ✅ Proper spacing

**Estimated Time:** 3 days

---

#### 3.2 Pitch Component

**Priority: HIGH** (complex, 397 lines)

**Challenge:** Canvas + SVG rendering with overlays

**Strategy:**
- Keep canvas/SVG logic unchanged
- Migrate overlay controls to Tailwind
- Add responsive controls

**Estimated Time:** 3 days

---

#### 3.3 Other Data Components

- **PitchInfoBanner** - 1 day
- **TotalSummary** - 1 day
- **SprintStats** - 1 day

**Estimated Time:** 3 days

---

### Phase 4: Control Components (5-7 days)

#### 4.1 Selector Components

**Components:**
- `SegmentSelector.tsx`
- `OrientationSelector.tsx`
- `PitchSelector.tsx`
- `PerformanceSelector.tsx`

**Pattern:**
```tsx
// Before - Custom CSS
<div className="selector">
  <button className="selector-option">Option 1</button>
</div>

// After - shadcn/ui Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select value={value} onValueChange={onChange}>
  <SelectTrigger className="w-full md:w-auto">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Estimated Time:** 2 days

---

#### 4.2 Controls Components

**Components:**
- `HeatmapControls.tsx` (sliders)
- `SprintControls.tsx` (sliders)
- `SatelliteControls.tsx` (sliders)

**Pattern:**
```tsx
// Before - Custom range input
<input type="range" className="slider" />

// After - shadcn/ui Slider
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label>Intensity: {value}</Label>
  <Slider
    value={[value]}
    onValueChange={([v]) => setValue(v)}
    min={0}
    max={100}
    step={1}
    className="touch-pan-y" // Mobile-friendly
  />
</div>
```

**Responsive:**
```tsx
// Stack controls on mobile, row on desktop
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div>
    <Label>Control 1</Label>
    <Slider ... />
  </div>
  <div>
    <Label>Control 2</Label>
    <Slider ... />
  </div>
</div>
```

**Estimated Time:** 3 days

---

### Phase 5: Canvas/Visualization Components (3-5 days)

**Components:**
- `HeatmapLayer.tsx`
- `SprintLayer.tsx`

**Strategy:**
- ✅ Keep canvas logic UNCHANGED
- ✅ Migrate container styles to Tailwind
- ✅ Add responsive canvas sizing

**Pattern:**
```tsx
// Canvas wrapper - responsive
<div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
  <canvas
    ref={canvasRef}
    className="absolute inset-0 w-full h-full"
    // Canvas logic stays same!
  />
</div>
```

**Estimated Time:** 2 days

---

### Phase 6: Polish & Optimization (5-7 days)

#### 6.1 Dark Mode Setup

**Install:**
```bash
npm install next-themes
```

**Setup:**
```tsx
// App.tsx
import { ThemeProvider } from "next-themes"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {/* app */}
    </ThemeProvider>
  )
}
```

**Toggle:**
```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

**Estimated Time:** 1 day

---

#### 6.2 PWA Setup (Optional)

**Install:**
```bash
npm install -D vite-plugin-pwa
```

**Config:**
```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Heatmap - Football Analytics',
        short_name: 'Heatmap',
        description: 'GPS Heatmap & Sprint Analysis for Football',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

**Estimated Time:** 1 day

---

#### 6.3 Performance Optimization

**Tasks:**
1. Remove old CSS files
2. Purge unused Tailwind classes
3. Optimize bundle size
4. Add lazy loading for heavy components
5. Optimize images

**Bundle Size Targets:**
- CSS: 26 KB → **18-20 KB** (-23% reduction)
- JS: No change (289 KB)

**Estimated Time:** 2 days

---

#### 6.4 Accessibility Audit

**Tasks:**
1. Keyboard navigation testing
2. Screen reader testing
3. Focus management
4. ARIA labels
5. Color contrast (WCAG AA)

**Tools:**
- axe DevTools
- Lighthouse
- WAVE

**Estimated Time:** 1 day

---

#### 6.5 Mobile Testing

**Devices to test:**
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad (768px)
- iPad Pro (1024px)

**Test scenarios:**
1. File upload (touch, drag-drop)
2. Session list navigation
3. Heatmap controls
4. Analysis page
5. Landscape orientation

**Estimated Time:** 2 days

---

## 5. Component Migration Priority

### Priority Matrix

| Component | Priority | Complexity | Impact | Estimated Time |
|-----------|----------|------------|--------|----------------|
| Layout + Sidebar | 🔴 Critical | High | High | 2 days |
| Button System | 🔴 Critical | Low | High | 1 day |
| FileUpload | 🟠 High | Medium | High | 2 days |
| FileSelector | 🟠 High | Medium | High | 1.5 days |
| SessionsTable | 🔴 Critical | High | High | 3 days |
| Pitch | 🟠 High | Very High | Medium | 3 days |
| HeatmapControls | 🟡 Medium | Medium | Medium | 1.5 days |
| SprintControls | 🟡 Medium | Medium | Medium | 1.5 days |
| PitchInfoBanner | 🟡 Medium | Low | Low | 1 day |
| SegmentSelector | 🟡 Medium | Low | Medium | 0.5 days |
| OrientationSelector | 🟡 Medium | Low | Medium | 0.5 days |
| PitchSelector | 🟡 Medium | Low | Medium | 0.5 days |
| HeatmapLayer | 🟢 Low | High | Low | 1 day |
| SprintLayer | 🟢 Low | High | Low | 1 day |
| SatelliteControls | 🟡 Medium | Medium | Low | 1 day |
| TotalSummary | 🟢 Low | Low | Low | 1 day |
| SprintStats | 🟢 Low | Low | Low | 1 day |

### Migration Order

**Week 1:**
1. Setup (Phase 0)
2. Layout + Sidebar
3. Button System

**Week 2:**
4. FileUpload
5. FileSelector
6. SessionsTable

**Week 3:**
7. Pitch Component
8. All Selectors
9. All Controls

**Week 4:**
10. Canvas/Viz Components
11. Dark Mode
12. PWA Setup
13. Testing & Polish

---

## 6. Risk Assessment

### High Risk Items

#### Risk 1: Canvas/SVG Rendering Issues
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Test canvas rendering early
- Keep existing logic, only change container styles
- Fallback plan: Keep old CSS for canvas components

#### Risk 2: Mobile Touch Issues
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Test on real devices early
- Use proper touch targets (min 44px)
- Add touch feedback

#### Risk 3: Bundle Size Increase
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Monitor bundle size at each phase
- Use Tailwind purge properly
- Lazy load heavy components

#### Risk 4: Breaking Existing Functionality
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Migrate one component at a time
- Test after each migration
- Keep Git history clean for rollback

### Medium Risk Items

#### Risk 5: Dark Mode Contrast Issues
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Use Tailwind's built-in dark mode colors
- Test with contrast checker
- Follow WCAG AA guidelines

#### Risk 6: Icon Migration Issues
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- Map Material Icons → Lucide Icons
- Keep icon sizes consistent
- Create mapping document

---

## 7. Rollback Plan

### Emergency Rollback

If critical issues arise:

```bash
# Quick rollback to main
git checkout main
npm install
npm run build
npm run deploy
```

### Partial Rollback

If specific component has issues:

```bash
# Cherry-pick fixes from main
git cherry-pick <commit-hash>

# Or revert specific component
git checkout main -- src/components/ComponentName.tsx
git checkout main -- src/components/ComponentName.css
```

### CSS Coexistence Strategy

During migration, **both CSS systems will coexist**:

```tsx
// Component can temporarily have both
import './OldComponent.css'  // Old CSS
import { cn } from '@/lib/utils'  // New Tailwind

// Gradual migration
<div className={cn("old-class", "new-tailwind-class")}>
```

Once component is fully migrated, delete `.css` file.

---

## 8. Success Metrics

### Performance Metrics

**Before:**
- CSS Bundle: 26.35 KB (5.15 KB gzipped)
- JS Bundle: 288.76 KB (89.68 KB gzipped)
- First Contentful Paint: TBD
- Time to Interactive: TBD

**Target:**
- CSS Bundle: **<20 KB** (<4 KB gzipped) - **23% reduction**
- JS Bundle: **<295 KB** (<92 KB gzipped) - Similar or better
- First Contentful Paint: **<1.5s** (3G)
- Time to Interactive: **<3.5s** (3G)
- Lighthouse Score: **>90**

### Developer Experience Metrics

**Before:**
- Time to style new component: ~30 min
- CSS files to maintain: 17
- Design consistency: Manual

**Target:**
- Time to style new component: **<10 min** (3x faster)
- CSS files to maintain: **1** (globals.css)
- Design consistency: **Enforced** (design tokens)

### Mobile Experience Metrics

**Targets:**
- Touch target size: **≥44px** (all buttons)
- Mobile Lighthouse Score: **>85**
- Responsive breakpoints: **5** (xs, sm, md, lg, xl)
- Mobile-first components: **100%**

### Code Quality Metrics

**Targets:**
- TypeScript errors: **0**
- ESLint warnings: **0**
- Accessibility violations: **0** (axe)
- WCAG Contrast: **AA** (all text)

---

## 9. Testing Strategy

### Phase Testing

After each phase:
1. ✅ Visual regression test
2. ✅ Component functionality test
3. ✅ TypeScript compilation
4. ✅ ESLint check
5. ✅ Bundle size check

### Manual Testing Checklist

**Desktop (Chrome, Firefox, Safari):**
- [ ] File upload (drag & drop)
- [ ] Session list
- [ ] Heatmap visualization
- [ ] Sprint detection
- [ ] All controls
- [ ] Navigation

**Mobile (real devices):**
- [ ] Touch interactions
- [ ] Drawer navigation
- [ ] Form inputs
- [ ] Canvas rendering
- [ ] Landscape mode
- [ ] PWA install (if enabled)

### Automated Testing

**Unit Tests:**
```bash
# Add tests for responsive utilities
npm run test
```

**E2E Tests (optional):**
```bash
# Playwright for critical flows
npx playwright test
```

---

## 10. Documentation Updates

### Update These Files:

1. **README.md** - Add Tailwind setup instructions
2. **CONTRIBUTING.md** - Styling guidelines
3. **CHANGELOG.md** - Migration notes
4. Create **STYLING_GUIDE.md** - Tailwind patterns

### Component Documentation

For each migrated component, document:
- Responsive breakpoints used
- Color tokens used
- Spacing system
- Accessibility considerations

---

## 11. Post-Migration Tasks

### Cleanup
- [ ] Delete all `.css` files
- [ ] Remove unused CSS imports
- [ ] Remove old design tokens
- [ ] Update package.json (remove unused deps)

### Optimization
- [ ] Analyze bundle size
- [ ] Optimize images
- [ ] Enable Tailwind JIT mode
- [ ] Setup CSS purge

### Documentation
- [ ] Create Storybook (optional)
- [ ] Document component library
- [ ] Update design system docs
- [ ] Add migration learnings doc

### Deployment
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Collect user feedback

---

## 12. Timeline Summary

```
Week 1: Setup + Core Infrastructure
├─ Day 1-2: Tailwind setup, shadcn/ui install
├─ Day 3-4: Layout + Sidebar migration
└─ Day 5: Button system

Week 2: File Upload + Data Display
├─ Day 1-2: FileUpload component
├─ Day 3: FileSelector component
└─ Day 4-5: SessionsTable (responsive)

Week 3: Controls + Selectors + Pitch
├─ Day 1-2: All selector components
├─ Day 3-4: All control components
└─ Day 5: Pitch component

Week 4: Polish + Testing + Deploy
├─ Day 1-2: Canvas components
├─ Day 3: Dark mode + PWA
├─ Day 4-5: Testing, optimization, deploy
```

**Total Estimated Time:** 18-22 working days

---

## 13. Next Steps

### To Begin Migration:

1. **Review this plan** with team/stakeholders
2. **Create GitHub issue** tracking this migration
3. **Create feature branch:** `feature/tailwind-migration`
4. **Start Phase 0** (setup)
5. **Daily progress updates** in GitHub issue

### Decision Points:

Before starting, decide:
- [ ] Include dark mode? (adds 1 day)
- [ ] Include PWA? (adds 1 day)
- [ ] Include Framer Motion animations? (adds 1-2 days)
- [ ] Create Storybook? (adds 2-3 days)
- [ ] Full accessibility audit? (included in plan)

---

## 14. Questions & Concerns

### Open Questions:

1. Do we need dark mode immediately or can it wait?
2. Should we add Storybook for component documentation?
3. Do we want progressive web app features?
4. Should we migrate icons Material → Lucide all at once?

### Concerns:

1. Canvas rendering on mobile - needs early testing
2. Bundle size - monitor closely
3. Touch interactions - test on real devices
4. Dark mode contrast - use automated tools

---

## ✅ Ready to Start?

Once this plan is approved, execute:

```bash
# Start migration
git checkout -b feature/tailwind-migration

# Begin Phase 0
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

**Let's build an enterprise-grade responsive web app!** 🚀

---

_Document Version: 1.0_
_Last Updated: 2026-04-13_
_Author: Claude Code Assistant_