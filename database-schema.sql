-- HyperTrack Pro Database Schema
-- Supabase PostgreSQL schema for fitness tracking

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique,
    full_name text,
    avatar_url text,
    training_level text check (training_level in ('novice', 'intermediate', 'advanced')) default 'intermediate',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workouts table
create table if not exists public.workouts (
    id text primary key,
    user_id text not null, -- Can be UUID for real users or 'tyler_historical' for Tyler's data
    date date not null,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration integer, -- in milliseconds
    split text, -- 'Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Shoulders', etc.
    time_of_day text check (time_of_day in ('AM', 'PM', 'Evening')),
    notes text,
    exercises jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises database table
create table if not exists public.exercises (
    id integer primary key,
    name text not null unique,
    muscle_group text not null,
    category text not null check (category in ('Compound', 'Isolation')),
    tier integer not null check (tier in (1, 2, 3)),
    mvc_percentage integer,
    equipment text not null,
    biomechanical_function text,
    target_rep_range text,
    rest_period integer, -- in seconds
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User settings table
create table if not exists public.user_settings (
    id uuid references auth.users on delete cascade not null primary key,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_date_idx on public.workouts(date);
create index if not exists workouts_user_date_idx on public.workouts(user_id, date);
create index if not exists exercises_muscle_group_idx on public.exercises(muscle_group);
create index if not exists exercises_category_idx on public.exercises(category);

-- Row Level Security Policies
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.user_settings enable row level security;
alter table public.exercises enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on public.profiles
    for select using (true);

create policy "Users can insert their own profile." on public.profiles
    for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
    for update using (auth.uid() = id);

-- Workouts policies
create policy "Users can view own workouts and Tyler's historical data." on public.workouts
    for select using (
        user_id = auth.uid()::text OR 
        user_id = 'tyler_historical'
    );

create policy "Users can insert own workouts." on public.workouts
    for insert with check (user_id = auth.uid()::text);

create policy "Users can update own workouts." on public.workouts
    for update using (user_id = auth.uid()::text);

create policy "Users can delete own workouts." on public.workouts
    for delete using (user_id = auth.uid()::text);

-- User settings policies
create policy "Users can view own settings." on public.user_settings
    for select using (auth.uid() = id);

create policy "Users can insert own settings." on public.user_settings
    for insert with check (auth.uid() = id);

create policy "Users can update own settings." on public.user_settings
    for update using (auth.uid() = id);

-- Exercises policies (read-only for all users)
create policy "Anyone can view exercises." on public.exercises
    for select using (true);

-- Functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.workouts
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_settings
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.exercises
    for each row execute procedure public.handle_updated_at();