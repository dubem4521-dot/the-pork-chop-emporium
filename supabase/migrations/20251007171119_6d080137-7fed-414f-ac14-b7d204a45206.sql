-- Add phone and address columns to orders table
ALTER TABLE public.orders 
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT;