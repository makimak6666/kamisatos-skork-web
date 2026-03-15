-- ---------------------------------------------------------
-- PART 5: Advanced Admin Injection Capabilities
-- ---------------------------------------------------------

-- We need a secure way for Admins to arbitrarily UPDATE
-- another user's loyalty_points without triggering standard 
-- RLS blockades (Users typically can't edit other users).
-- We achieve this by writing a "Security Definer" PostgreSQL Function (RPC)

CREATE OR REPLACE FUNCTION set_loyalty_points(target_user_id UUID, new_points INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This runs the function with the privileges of the creator
AS $$
BEGIN
    -- 1. Double check that the person CALLING this function is actually an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya admin yang bisa memanipulasi poin.';
    END IF;

    -- 2. If genuine, perform the forceful update
    UPDATE public.profiles
    SET loyalty_points = new_points
    WHERE id = target_user_id;

END;
$$;

-- ---------------------------------------------------------
-- PART 6: Allow Admin to Ghost-write Reviews
-- ---------------------------------------------------------

-- By default, our earlier RLS policy says:
-- "Users can only insert testimonials if user_id = auth.uid()"
-- To allow Admins to inject reviews for OTHER users, we must add an override policy.

CREATE POLICY "Admin can insert testimonials for anyone" ON public.testimonials
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
