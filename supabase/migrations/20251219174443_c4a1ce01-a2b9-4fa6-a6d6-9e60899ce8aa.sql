-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create known_fake_accounts table for the fake account database
CREATE TABLE public.known_fake_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  platform TEXT,
  reason TEXT NOT NULL,
  evidence TEXT,
  reported_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dismissed')),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (username, platform)
);

-- Enable RLS on known_fake_accounts
ALTER TABLE public.known_fake_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for known_fake_accounts
CREATE POLICY "Anyone can read confirmed fake accounts"
ON public.known_fake_accounts FOR SELECT
USING (status = 'confirmed');

CREATE POLICY "Admins can view all fake accounts"
ON public.known_fake_accounts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can report fake accounts"
ON public.known_fake_accounts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage fake accounts"
ON public.known_fake_accounts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fake accounts"
ON public.known_fake_accounts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on known_fake_accounts
CREATE TRIGGER update_fake_accounts_updated_at
  BEFORE UPDATE ON public.known_fake_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin-only policy to view ALL scan history
CREATE POLICY "Admins can view all scan history"
ON public.scan_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on scan_history for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_history;

-- Set REPLICA IDENTITY FULL for complete row data in realtime updates
ALTER TABLE public.scan_history REPLICA IDENTITY FULL;

-- Create function to automatically assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger to assign default role
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();