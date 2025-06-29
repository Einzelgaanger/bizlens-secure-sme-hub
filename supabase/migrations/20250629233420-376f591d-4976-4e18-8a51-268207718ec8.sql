
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_employees table for employee-business relationships
CREATE TABLE public.business_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  work_position TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Create stock_items table
CREATE TABLE public.stock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  sale_type TEXT NOT NULL CHECK (sale_type IN ('stock_item', 'custom_item', 'mixed')),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'bank', 'credit', 'debt')),
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  sold_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table for individual items in a sale
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  stock_item_id UUID REFERENCES public.stock_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'bank', 'credit', 'debt')),
  receipt_number TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date DATE,
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  debt_type TEXT NOT NULL CHECK (debt_type IN ('customer_debt', 'business_debt')),
  debtor_name TEXT NOT NULL,
  debtor_phone TEXT,
  debtor_email TEXT,
  original_amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue', 'written_off')),
  related_sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  related_expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt_payments table
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'bank', 'credit')),
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'overdue_debt', 'recurring_expense', 'payment_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'paypal', 'credit_card')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for businesses
CREATE POLICY "Business owners and employees can view businesses" ON public.businesses FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Business owners can update their businesses" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Business owners can delete their businesses" ON public.businesses FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for business_employees
CREATE POLICY "Business members can view employee relationships" ON public.business_employees FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees be WHERE be.business_id = business_id AND be.user_id = auth.uid() AND be.role = 'admin')
);

CREATE POLICY "Business owners and admins can manage employees" ON public.business_employees FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees be WHERE be.business_id = business_id AND be.user_id = auth.uid() AND be.role = 'admin')
);

CREATE POLICY "Business owners and admins can update employees" ON public.business_employees FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees be WHERE be.business_id = business_id AND be.user_id = auth.uid() AND be.role = 'admin')
);

-- RLS Policies for stock_items
CREATE POLICY "Business members can view stock items" ON public.stock_items FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = stock_items.business_id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Business members can manage stock items" ON public.stock_items FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = stock_items.business_id AND user_id = auth.uid() AND status = 'active')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = stock_items.business_id AND user_id = auth.uid() AND status = 'active')
);

-- RLS Policies for sales (similar pattern for other tables)
CREATE POLICY "Business members can view sales" ON public.sales FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = sales.business_id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Business members can manage sales" ON public.sales FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = sales.business_id AND user_id = auth.uid() AND status = 'active')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = sales.business_id AND user_id = auth.uid() AND status = 'active')
);

-- Apply similar RLS policies to remaining tables
CREATE POLICY "Business members can view sale items" ON public.sale_items FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.sales s JOIN public.businesses b ON s.business_id = b.id 
    WHERE s.id = sale_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
);

CREATE POLICY "Business members can manage sale items" ON public.sale_items FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.sales s JOIN public.businesses b ON s.business_id = b.id 
    WHERE s.id = sale_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.sales s JOIN public.businesses b ON s.business_id = b.id 
    WHERE s.id = sale_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
);

-- Similar policies for expenses, debts, debt_payments, notifications, activity_logs, subscriptions
CREATE POLICY "Business members can view expenses" ON public.expenses FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = expenses.business_id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Business members can manage expenses" ON public.expenses FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = expenses.business_id AND user_id = auth.uid() AND status = 'active')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = expenses.business_id AND user_id = auth.uid() AND status = 'active')
);

-- Policies for debts
CREATE POLICY "Business members can view debts" ON public.debts FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = debts.business_id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Business members can manage debts" ON public.debts FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = debts.business_id AND user_id = auth.uid() AND status = 'active')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = debts.business_id AND user_id = auth.uid() AND status = 'active')
);

-- Policies for debt_payments
CREATE POLICY "Business members can view debt payments" ON public.debt_payments FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.debts d JOIN public.businesses b ON d.business_id = b.id 
    WHERE d.id = debt_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
);

CREATE POLICY "Business members can manage debt payments" ON public.debt_payments FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.debts d JOIN public.businesses b ON d.business_id = b.id 
    WHERE d.id = debt_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.debts d JOIN public.businesses b ON d.business_id = b.id 
    WHERE d.id = debt_id AND (b.owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = b.id AND user_id = auth.uid() AND status = 'active')))
);

-- Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Policies for activity_logs (admin only view for full logs)
CREATE POLICY "Business owners and admins can view activity logs" ON public.activity_logs FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = activity_logs.business_id AND user_id = auth.uid() AND role = 'admin' AND status = 'active')
);

CREATE POLICY "System can create activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Policies for subscriptions (owners and admins only)
CREATE POLICY "Business owners and admins can view subscriptions" ON public.subscriptions FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = subscriptions.business_id AND user_id = auth.uid() AND role = 'admin' AND status = 'active')
);

CREATE POLICY "Business owners and admins can manage subscriptions" ON public.subscriptions FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = subscriptions.business_id AND user_id = auth.uid() AND role = 'admin' AND status = 'active')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.business_employees WHERE business_id = subscriptions.business_id AND user_id = auth.uid() AND role = 'admin' AND status = 'active')
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_business_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_logs (business_id, user_id, action, entity_type, entity_id, details)
  VALUES (p_business_id, p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- Create function to check stock levels and create notifications
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stock_item RECORD;
BEGIN
  FOR stock_item IN 
    SELECT si.*, b.owner_id, b.name as business_name
    FROM public.stock_items si
    JOIN public.businesses b ON si.business_id = b.id
    WHERE si.quantity <= si.min_stock_level AND si.min_stock_level > 0
  LOOP
    INSERT INTO public.notifications (business_id, user_id, type, title, message, related_id)
    VALUES (
      stock_item.business_id,
      stock_item.owner_id,
      'low_stock',
      'Low Stock Alert',
      'Item "' || stock_item.name || '" is running low. Current stock: ' || stock_item.quantity || ', Minimum level: ' || stock_item.min_stock_level,
      stock_item.id
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
