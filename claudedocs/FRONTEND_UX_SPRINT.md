# Snappy Platform - Frontend & UX Sprint Plan

**Fecha**: 2026-01-25
**Proyecto**: snappy-platform
**Path**: ~/Dev/snappy-platform
**Contexto**: Pre-reset Mac - Guardar para siguiente sprint

---

## Project Overview

### Purpose
Snappy captura estructura de páginas web y las transforma en especificaciones de código limpias y funcionales.

### Workflow
1. **Capture** - Chrome extension captura HTML, texto, UX interactions
2. **Process** - Normaliza y sanitiza los datos
3. **Visualize** - Dashboard para ver versiones raw/normalized/legal-safe
4. **Generate** - (Futuro) Claude API para generar código production-ready

---

## Tech Stack Actual

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | Next.js | 16.1.4 (React 19) |
| Language | TypeScript | 5.3.3 (strict) |
| Styling | Tailwind CSS | 3.4.1 |
| UI Components | shadcn/ui | Latest |
| Backend | Supabase | 1.163.0 |
| Database | PostgreSQL | via Supabase |
| Testing | Vitest | 1.2.0 |
| State | Zustand | 4.5.0 |
| Icons | Lucide React | 0.344.0 |

---

## Estructura Actual

```
snappy-platform/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing + upload/viewer
│   ├── globals.css          # Global Tailwind + theme
│   ├── api/snapshot/route.ts
│   └── snapshots/page.tsx   # Lista de snapshots
│
├── components/
│   ├── SnapshotUploader.tsx # Drag & drop (216 LOC)
│   ├── SnapshotViewer.tsx   # JSON explorer (154 LOC)
│   └── ui/                  # shadcn/ui primitives
│       ├── button.tsx
│       └── card.tsx
│
├── lib/
│   ├── types.ts             # 100+ interfaces
│   ├── normalizer.ts        # Page normalization
│   ├── legal-safe.ts        # Branding sanitization
│   └── supabase/
│
├── extension/               # Chrome Extension v2.0
├── bookmarklet/             # Mobile alternative
├── supabase/migrations/
├── tests/                   # 98% coverage
└── docs/
```

---

## Estado UI/UX Actual

### Lo que existe
- Landing page con hero section
- Snapshot uploader (drag & drop)
- JSON viewer (3 modos: raw/normalized/legal-safe)
- Snapshots list page
- Dark mode support (CSS vars)
- Responsive mobile design
- Error handling básico

### Componentes shadcn/ui disponibles
- Button (6 variants)
- Card (con Header, Title, Description, Content, Footer)

### Design System
- **Font**: Inter (Google Fonts)
- **Colors**: Blue/Indigo primary
- **Spacing**: Tailwind scale
- **Animations**: tailwindcss-animate

---

## SPRINT BACKLOG - Frontend & UX

### Alta Prioridad
| ID | Task | Descripción | Estimación |
|----|------|-------------|------------|
| FE-01 | Dashboard mejorado | Filters, sorting, pagination en /snapshots | M |
| FE-02 | Authentication UI | Login/signup pages profesionales | L |
| FE-03 | Empty states | Mejores placeholders cuando no hay data | S |
| FE-04 | Loading states | Skeleton screens en vez de spinners | M |
| FE-05 | Error boundaries | Graceful error handling con fallbacks | S |

### Media Prioridad
| ID | Task | Descripción | Estimación |
|----|------|-------------|------------|
| FE-06 | Animaciones | Framer Motion para transiciones | M |
| FE-07 | Accesibilidad | WCAG audit con axe-core | M |
| FE-08 | Más componentes | Dialog, Dropdown, Tabs, Toast | M |
| FE-09 | Theme toggle | Switch light/dark visible | S |
| FE-10 | Mobile nav | Hamburger menu, touch targets 44px | M |

### Baja Prioridad
| ID | Task | Descripción | Estimación |
|----|------|-------------|------------|
| FE-11 | Charts | Visualizar estructura de snapshots | L |
| FE-12 | Code preview | Preview del código generado | L |
| FE-13 | Collaboration | Share/comment en snapshots | XL |
| FE-14 | Analytics | Usage metrics dashboard | L |
| FE-15 | Settings | User preferences page | M |

**Estimaciones**: S = 1-2h | M = 2-4h | L = 4-8h | XL = 8h+

---

## Componentes a Agregar (shadcn/ui)

```bash
# Ejecutar estos comandos para agregar componentes
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add separator
```

---

## Dependencias a Agregar

```bash
# Animaciones
pnpm add framer-motion

# Accesibilidad testing
pnpm add -D @axe-core/react

# Forms (si auth UI)
pnpm add react-hook-form zod @hookform/resolvers
```

---

## Database Tables (snappy_ prefix)

1. **snappy_profiles** - User profiles
2. **snappy_snapshots** - Raw captures
3. **snappy_normalized_snapshots** - Processed versions
4. **snappy_projects** - Group snapshots
5. **snappy_project_snapshots** - Junction table

---

## Comandos de Desarrollo

```bash
cd ~/Dev/snappy-platform
pnpm dev              # Start dev server :3000
pnpm build            # Production build
pnpm test             # Run tests
pnpm test:coverage    # Coverage report
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
```

---

## Notas para Siguiente Sprint

1. **Prioridad sugerida**: FE-04 (Skeletons) → FE-01 (Dashboard) → FE-03 (Empty states)
2. **Quick wins**: FE-09 (Theme toggle), FE-03 (Empty states)
3. **Considera**: Agregar Framer Motion antes de hacer muchos componentes nuevos
4. **Auth UI**: Esperar a que backend auth esté listo (Supabase config existe)

---

## Referencias

- shadcn/ui docs: https://ui.shadcn.com
- Tailwind docs: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion/
- Supabase Auth UI: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui

---

*Generado por Claude Code - 2026-01-25*
*Guardar antes de Mac reset*
