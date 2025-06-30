
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Business owners and employees can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can update their businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can create businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can delete their businesses" ON public.businesses;

-- Create simpler, non-recursive policies for businesses
CREATE POLICY "Users can view businesses they own" ON public.businesses 
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view businesses where they are employees" ON public.businesses 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = businesses.id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Users can create their own businesses" ON public.businesses 
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their businesses" ON public.businesses 
FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can delete their businesses" ON public.businesses 
FOR DELETE USING (auth.uid() = owner_id);

-- Fix business_employees policies
DROP POLICY IF EXISTS "Business members can view employee relationships" ON public.business_employees;
DROP POLICY IF EXISTS "Business owners and admins can manage employees" ON public.business_employees;
DROP POLICY IF EXISTS "Business owners and admins can update employees" ON public.business_employees;

CREATE POLICY "Users can view their own employee records" ON public.business_employees 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Business owners can view all employee records" ON public.business_employees 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can manage employees" ON public.business_employees 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

-- Fix stock_items policies
DROP POLICY IF EXISTS "Business members can view stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Business members can manage stock items" ON public.stock_items;

CREATE POLICY "Business owners can manage stock items" ON public.stock_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business employees can manage stock items" ON public.stock_items 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = stock_items.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = stock_items.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Fix sales policies
DROP POLICY IF EXISTS "Business members can view sales" ON public.sales;
DROP POLICY IF EXISTS "Business members can manage sales" ON public.sales;

CREATE POLICY "Business owners can manage sales" ON public.sales 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business employees can manage sales" ON public.sales 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = sales.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = sales.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Fix expenses policies
DROP POLICY IF EXISTS "Business members can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Business members can manage expenses" ON public.expenses;

CREATE POLICY "Business owners can manage expenses" ON public.expenses 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business employees can manage expenses" ON public.expenses 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = expenses.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = expenses.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Fix debts policies
DROP POLICY IF EXISTS "Business members can view debts" ON public.debts;
DROP POLICY IF EXISTS "Business members can manage debts" ON public.debts;

CREATE POLICY "Business owners can manage debts" ON public.debts 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business employees can manage debts" ON public.debts 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = debts.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = debts.business_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Simplify activity_logs policies
DROP POLICY IF EXISTS "Business owners and admins can view activity logs" ON public.activity_logs;

CREATE POLICY "Business owners can view activity logs" ON public.activity_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business admins can view activity logs" ON public.activity_logs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = activity_logs.business_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  )
);

-- Simplify subscriptions policies
DROP POLICY IF EXISTS "Business owners and admins can view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Business owners and admins can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Business owners can manage subscriptions" ON public.subscriptions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Business admins can manage subscriptions" ON public.subscriptions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = subscriptions.business_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_employees 
    WHERE business_id = subscriptions.business_id 
    AND user_id = auth.uid() 
    AND role = 'admin' 
    AND status = 'active'
  )
);
