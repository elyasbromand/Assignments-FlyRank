function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(err) {
  const header = err?.headers?.["retry-after"] ?? err?.response?.headers?.["retry-after"];
  if (header == null) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

function shouldRetry(err) {
  if (!err) return false;
  const status = err.status ?? err.statusCode ?? err?.response?.status;
  if (status === 408 || status === 429) return true;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  const code = err.code ?? err.cause?.code;
  if (code === "ETIMEDOUT" || code === "ECONNRESET" || code === "ECONNABORTED") return true;
  if (/timeout/i.test(err.message ?? "")) return true;
  return false;
}

export async function withRetry(fn, { maxAttempts = 3, onRetry } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts - 1 || !shouldRetry(err)) throw err;

      const retryAfter = getRetryAfterMs(err);
      const backoff = retryAfter ?? (1000 * 2 ** attempt + Math.random() * 300);
      if (onRetry) onRetry({ attempt, err, delayMs: backoff });
      await sleep(backoff);
    }
  }
  throw lastErr;
}
