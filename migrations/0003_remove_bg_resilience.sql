ALTER TABLE credit_transactions ADD COLUMN task_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_task_reason
  ON credit_transactions(task_id, reason)
  WHERE task_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_paypal_order_grant
  ON credit_transactions(paypal_order_id)
  WHERE paypal_order_id IS NOT NULL AND amount > 0;

CREATE TABLE IF NOT EXISTS image_processing_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  credits_required INTEGER NOT NULL DEFAULT 1,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  remove_bg_credits_charged REAL,
  remove_bg_status_code INTEGER,
  remove_bg_request_id TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE(user_id, idempotency_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_image_processing_tasks_user_status
  ON image_processing_tasks(user_id, status);

CREATE INDEX IF NOT EXISTS idx_image_processing_tasks_created_at
  ON image_processing_tasks(created_at);

CREATE TABLE IF NOT EXISTS remove_bg_account_status (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  available_credits REAL,
  low_balance_threshold REAL,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  checked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
