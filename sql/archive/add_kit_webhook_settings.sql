
ALTER TABLE webhook_settings 
ADD COLUMN IF NOT EXISTS kit_webhook_url text DEFAULT '',
ADD COLUMN IF NOT EXISTS kit_role_id text DEFAULT '';
