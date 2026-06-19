-- Auto-adjust inventory quantity when a batch transaction is recorded
CREATE OR REPLACE FUNCTION public.apply_inventory_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE public.inventory_items
      SET quantity = quantity + NEW.quantity, updated_at = now()
      WHERE id = NEW.item_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE public.inventory_items
      SET quantity = GREATEST(0, quantity - NEW.quantity), updated_at = now()
      WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_inventory_transaction ON public.inventory_transactions;
CREATE TRIGGER trg_apply_inventory_transaction
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_inventory_transaction();

-- Unified communications: support both SMS and Email channels
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sms';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS email text;