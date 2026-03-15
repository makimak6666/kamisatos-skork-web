-- ---------------------------------------------------------
-- PART 1: User Profiles & Loyalty
-- ---------------------------------------------------------
create table public.profiles (
  id uuid references auth.users not null primary key,
  raw_username text unique not null,
  role text default 'user',  -- 'user' or 'admin'
  loyalty_points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Anyone can read profiles (for username lookup)"
  on profiles for select using (true);
  
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can update any profile (points)"
  on profiles for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ---------------------------------------------------------
-- PART 2: Testimonials Table
-- ---------------------------------------------------------
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.testimonials enable row level security;

-- Policies for Testimonials
create policy "Anyone can read approved testimonials"
  on testimonials for select using (status = 'approved');

create policy "Users can read their own pending/rejected testimonials"
  on testimonials for select using (auth.uid() = user_id);

create policy "Admins can read ALL testimonials"
  on testimonials for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users can insert their own testimonials"
  on testimonials for insert with check (auth.uid() = user_id);

-- Only Admins can Update status (approve/reject)
create policy "Admins can update testimonials"
  on testimonials for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ---------------------------------------------------------
-- PART 3: Triggers & Master Admin Setup
-- ---------------------------------------------------------

-- Auto Create Profile when User Registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, raw_username, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'raw_username',
    case when (new.raw_user_meta_data->>'raw_username') = 'ayakamanis' then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate Trigger securely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Auto Add Loyalty Points when Testi is Approved
create or replace function public.reward_points_on_approval()
returns trigger as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    update public.profiles
    set loyalty_points = loyalty_points + 50
    where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_testi_approved on public.testimonials;
create trigger on_testi_approved
  after update on public.testimonials
  for each row execute procedure public.reward_points_on_approval();

-- (MANUAL FIX FOR EXISTING ACCOUNT): If you already registered "ayakamanis", run this single line to promote it now:
UPDATE public.profiles SET role = 'admin' WHERE raw_username = 'ayakamanis';
