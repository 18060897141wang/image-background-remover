import { Env, createId } from "./auth";

export type ProcessingTaskStatus = "processing" | "completed" | "failed";

export interface ProcessingTask {
  id: string;
  user_id: string;
  idempotency_key: string;
  status: ProcessingTaskStatus;
  error_code: string | null;
  error_message: string | null;
}

export async function createProcessingTask(
  env: Env,
  userId: string,
  idempotencyKey: string,
  file: File
) {
  const now = new Date().toISOString();
  const taskId = createId("task");
  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO image_processing_tasks
      (id, user_id, idempotency_key, status, file_type, file_size, created_at, updated_at)
     VALUES (?, ?, ?, 'processing', ?, ?, ?, ?)`
  )
    .bind(taskId, userId, idempotencyKey, file.type, file.size, now, now)
    .run();

  if (Number(result.meta?.changes ?? 0) === 1) {
    return {
      task: {
        id: taskId,
        user_id: userId,
        idempotency_key: idempotencyKey,
        status: "processing",
        error_code: null,
        error_message: null
      } satisfies ProcessingTask,
      created: true
    };
  }

  const existing = await env.DB.prepare(
    `SELECT id, user_id, idempotency_key, status, error_code, error_message
     FROM image_processing_tasks
     WHERE user_id = ? AND idempotency_key = ?`
  )
    .bind(userId, idempotencyKey)
    .first<ProcessingTask>();

  return { task: existing ?? null, created: false };
}

export async function completeProcessingTask(
  env: Env,
  taskId: string,
  options: {
    removeBgCreditsCharged: number | null;
    removeBgStatusCode: number;
    removeBgRequestId: string | null;
  }
) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE image_processing_tasks
     SET status = 'completed',
         credits_charged = 1,
         remove_bg_credits_charged = ?,
         remove_bg_status_code = ?,
         remove_bg_request_id = ?,
         error_code = NULL,
         error_message = NULL,
         completed_at = ?,
         updated_at = ?
     WHERE id = ?`
  )
    .bind(
      options.removeBgCreditsCharged,
      options.removeBgStatusCode,
      options.removeBgRequestId,
      now,
      now,
      taskId
    )
    .run();
}

export async function failProcessingTask(
  env: Env,
  taskId: string,
  options: {
    errorCode: string;
    errorMessage: string;
    removeBgStatusCode: number | null;
    removeBgRequestId: string | null;
  }
) {
  await env.DB.prepare(
    `UPDATE image_processing_tasks
     SET status = 'failed',
         credits_charged = 0,
         remove_bg_status_code = ?,
         remove_bg_request_id = ?,
         error_code = ?,
         error_message = ?,
         updated_at = ?
     WHERE id = ?`
  )
    .bind(
      options.removeBgStatusCode,
      options.removeBgRequestId,
      options.errorCode,
      options.errorMessage,
      new Date().toISOString(),
      taskId
    )
    .run();
}
