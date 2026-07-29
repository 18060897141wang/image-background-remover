CREATE TABLE IF NOT EXISTS creem_checkouts (
  id TEXT PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  credits INTEGER NOT NULL,
  order_id TEXT,
  customer_id TEXT,
  customer_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE credit_transactions ADD COLUMN creem_checkout_id TEXT;

CREATE INDEX IF NOT EXISTS idx_creem_checkouts_user_id ON creem_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_creem_checkouts_request_id ON creem_checkouts(request_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_creem_checkout_grant
  ON credit_transactions(creem_checkout_id)
  WHERE creem_checkout_id IS NOT NULL AND amount > 0;
