# Architecture

- App root: `hypertrack-pro-v2` (Create React App)
- Feature-first structure with shared libs under `src/lib` and `src/shared`.
- Supabase client in `src/lib/supabase`, offline in `src/lib/offline`.
- Algorithms preserved in `src/lib/algorithms`.

## Build
- Node 20+, build via `npm run build`, output `build/`.

## Data
- Supabase tables: workouts, workout_exercises, sets, exercises.
- Env: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`.
