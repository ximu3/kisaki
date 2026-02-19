# Kisaki Plugin Template

A Kisaki plugin.

## Development

```bash
pnpm install
pnpm dev    # Watch mode
pnpm build  # Production build
```

## Structure

```
src/
├── main/           # Main process entry
├── renderer/       # Renderer process entry
│   └── components/ # Vue components
└── shared/         # Shared types (IPC, events, manifest)
```

## Key APIs

**Main Process** (`@kisaki/plugin-sdk/main`):

- `container` - Service container
- `schema` - Database schema

**Renderer Process** (`@kisaki/plugin-sdk/renderer`):

- `db`, `schema` - Direct database access
- `events` - Event system
- `extensions` - UI extensions
- `notify` - Notifications
- `useAsyncData`, `useEvent`, etc. - Composables
- `useThemeStore`, etc. - Stores
