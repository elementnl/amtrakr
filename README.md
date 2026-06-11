# Amtrakr

Live Amtrak train tracking. Every active train on a map, with real-time positions, delay info, and full journey timelines.

## Features

- Live map of all active Amtrak trains
- Per-train panel with stop-by-stop timeline and delay badges
- Station view with today's arrivals and departures
- Search by train number or station name
- Mobile-optimized bottom sheet experience

## Tech stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [MapLibre GL JS](https://maplibre.org) for the map
- [TanStack Query v5](https://tanstack.com/query) for data fetching
- [Framer Motion](https://www.framer.com/motion) for animations
- [Tailwind CSS v4](https://tailwindcss.com)

## Setup

```bash
npm install
npm run dev
```

## Data

Train positions and schedules are sourced from [Amtraker](https://github.com/piemadd/amtraker) by piemadd. Not affiliated with or endorsed by Amtrak.

## License

MIT
