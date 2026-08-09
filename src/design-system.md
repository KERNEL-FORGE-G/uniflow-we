# Design System - UniFlow Web

Ce document formalise les règles de style pour garantir une cohérence visuelle à 100% avec les planches UI.

## Couleurs (Tailwind v4)
Définies dans `src/index.css` :
- `--color-primary`: `#1e3a8a` (Royal Blue)
- `--color-teal`: `#0d9488` (Teal)
- `--color-bg`: `#f3f4f6` (Gray-100)
- `--color-surface`: `#ffffff` (White)
- `--color-text`: `#111827` (Gray-900)
- `--color-muted`: `#6b7280` (Gray-500)
- `--color-border`: `#e5e7eb` (Gray-200)

## Composants UI
### Button
- `primary`: `bg-primary text-white hover:bg-primary-light shadow-sm`
- `secondary`: `bg-teal text-white hover:bg-teal-light shadow-sm`
- `outline`: `border border-border bg-white text-gray-700 hover:bg-gray-50`

### Cards
- Standard: `bg-white rounded-xl border border-border p-6`

### Badges
- `primary`: `bg-primary/10 text-primary`
- `success`: `bg-emerald-100 text-emerald-700`
- `warning`: `bg-orange-100 text-orange-700`
- `danger`: `bg-red-100 text-red-700`

## Règles de mise en page
- **Spacing**: Utiliser `space-y-6` pour les conteneurs de pages.
- **Radius**: `rounded-xl` pour les conteneurs principaux, `rounded-lg` pour les éléments interactifs.
- **Typography**: Inter (default).
