
-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view businesses they own" ON public.businesses;
DROP POLICY IF EXISTS "Users can view businesses where they are employees" ON public.businesses;
DROP POLICY IF EXISTS "Users can create their own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can update their businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can delete their businesses" ON public.businesses;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_business_owner(business_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_business_employee(business_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = is_business_employee.business_id 
    AND user_id = is_business_employee.user_id 
    AND status = 'active'
  );
$$;

-- Create simple, non-recursive policies using the functions
CREATE POLICY "Users can view their own businesses" ON public.businesses 
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view businesses where they work" ON public.businesses 
FOR SELECT USING (public.is_business_employee(id, auth.uid()));

CREATE POLICY "Users can create businesses" ON public.businesses 
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update businesses" ON public.businesses 
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete businesses" ON public.businesses 
FOR DELETE USING (owner_id = auth.uid());

-- Fix other table policies to use the security definer functions
DROP POLICY IF EXISTS "Business owners can manage stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Business employees can manage stock items" ON public.stock_items;

CREATE POLICY "Business members can manage stock items" ON public.stock_items 
FOR ALL USING (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
)
WITH CHECK (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
);

-- Fix sales policies
DROP POLICY IF EXISTS "Business owners can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Business employees can manage sales" ON public.sales;

CREATE POLICY "Business members can manage sales" ON public.sales 
FOR ALL USING (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
)
WITH CHECK (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
);

-- Fix expenses policies
DROP POLICY IF EXISTS "Business owners can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Business employees can manage expenses" ON public.expenses;

CREATE POLICY "Business members can manage expenses" ON public.expenses 
FOR ALL USING (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
)
WITH CHECK (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
);

-- Fix debts policies
DROP POLICY IF EXISTS "Business owners can manage debts" ON public.debts;
DROP POLICY IF EXISTS "Business employees can manage debts" ON public.debts;

CREATE POLICY "Business members can manage debts" ON public.debts 
FOR ALL USING (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
)
WITH CHECK (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
);

-- Fix business_employees policies
DROP POLICY IF EXISTS "Users can view their own employee records" ON public.business_employees;
DROP POLICY IF EXISTS "Business owners can view all employee records" ON public.business_employees;
DROP POLICY IF EXISTS "Business owners can manage employees" ON public.business_employees;

CREATE POLICY "Users can view employee records" ON public.business_employees 
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_business_owner(business_id, auth.uid())
);

CREATE POLICY "Business owners can manage employees" ON public.business_employees 
FOR ALL USING (public.is_business_owner(business_id, auth.uid()))
WITH CHECK (public.is_business_owner(business_id, auth.uid()));

-- Fix activity_logs policies
DROP POLICY IF EXISTS "Business owners can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Business admins can view activity logs" ON public.activity_logs;

CREATE POLICY "Business members can view activity logs" ON public.activity_logs 
FOR SELECT USING (
  public.is_business_owner(business_id, auth.uid()) OR 
  public.is_business_employee(business_id, auth.uid())
);

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Business owners can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Business admins can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Business owners can manage subscriptions" ON public.subscriptions 
FOR ALL USING (public.is_business_owner(business_id, auth.uid()))
WITH CHECK (public.is_business_owner(business_id, auth.uid()));
