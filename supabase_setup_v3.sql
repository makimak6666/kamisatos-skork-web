-- ---------------------------------------------------------
-- PART 4: Image Support & Storage Setup
-- ---------------------------------------------------------

-- 1. Add image_url column to existing testimonials table
-- (We use IF NOT EXISTS to prevent errors if run multiple times)
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Make rating optional (nullable) so Admins can upload standalone images without rating
ALTER TABLE public.testimonials 
ALTER COLUMN rating DROP NOT NULL;

-- 3. Storage Bucket Configuration
-- CREATE BUCKET for Testimonial Images (Run this ONLY if you haven't created it via UI)
insert into storage.buckets (id, name, public) 
values ('testi_images', 'testi_images', true)
on conflict (id) do nothing;

-- 4. Storage Security Policies (RLS for the Bucket)
-- Allow anyone to view images
create policy "Anyone can view testi images"
on storage.objects for select
using ( bucket_id = 'testi_images' );

-- Allow logged in users to upload their own images
create policy "Users can upload testi images"
on storage.objects for insert
with check (
    bucket_id = 'testi_images' 
    and auth.uid() = owner
);

-- Allow Admins to delete any image
create policy "Admins can delete any testi images"
on storage.objects for delete
using (
    bucket_id = 'testi_images' 
    and (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
);

-- Allow Admins to update (overwrite) images
create policy "Admins can update appliable testi images"
on storage.objects for update
using (
    bucket_id = 'testi_images' 
    and (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
);

-- Allow Admins to delete testimonials fully (Database row deletion policy)
create policy "Admins can delete testimonials"
  on public.testimonials for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
