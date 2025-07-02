
-- Fix the profiles table to match the code expectations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee';

-- Update the debts table to match the interface expected by the code
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_business_debt BOOLEAN DEFAULT false;

-- Update original_amount to amount and remaining_amount to calculated field
UPDATE public.debts SET amount = original_amount WHERE amount = 0;
UPDATE public.debts SET paid_amount = original_amount - remaining_amount WHERE paid_amount = 0;

-- Add missing column to expenses table to match code expectations
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Update existing records to have recorded_by
UPDATE public.expenses SET recorded_by = (SELECT id FROM auth.users LIMIT 1) WHERE recorded_by IS NULL;

-- Add missing columns to profiles table for employee management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update full_name from first_name and last_name
UPDATE public.profiles 
SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, email)
WHERE full_name IS NULL;

-- Update the user registration function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
