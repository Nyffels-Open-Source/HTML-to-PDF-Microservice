import { HttpError } from './errors';

type Task<T> = () => Promise<T>;
type QueueEntry = {
  resolve: () => void;
};

export interface RenderQueueMetrics {
  activeRenders: number;
  queuedRenders: number;
  maxConcurrentRenders: number;
  maxQueuedRenders: number | null;
  totalRequests: number;
  totalCompleted: number;
  totalRejected: number;
  totalWaitTimeMs: number;
  averageWaitTimeMs: number;
  maxObservedWaitTimeMs: number;
}

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_WAIT_LOG_THRESHOLD_MS = 1000;

const configuredConcurrency = Number(process.env.PDF_RENDER_CONCURRENCY);
const configuredQueueLimit = Number(process.env.PDF_RENDER_QUEUE_LIMIT);
const configuredWaitLogThreshold = Number(process.env.PDF_RENDER_WAIT_LOG_THRESHOLD_MS);

const maxConcurrentRenders = Number.isFinite(configuredConcurrency) && configuredConcurrency > 0
  ? Math.floor(configuredConcurrency)
  : DEFAULT_CONCURRENCY;

const maxQueuedRenders = Number.isFinite(configuredQueueLimit) && configuredQueueLimit >= 0
  ? Math.floor(configuredQueueLimit)
  : Number.POSITIVE_INFINITY;

let activeRenders = 0;
const waitingResolvers: QueueEntry[] = [];
let totalRequests = 0;
let totalCompleted = 0;
let totalRejected = 0;
let totalWaitTimeMs = 0;
let maxObservedWaitTimeMs = 0;

const waitLogThresholdMs = Number.isFinite(configuredWaitLogThreshold) && configuredWaitLogThreshold >= 0
  ? Math.floor(configuredWaitLogThreshold)
  : DEFAULT_WAIT_LOG_THRESHOLD_MS;

function recordWaitTime(waitTimeMs: number): void {
  totalWaitTimeMs += waitTimeMs;
  maxObservedWaitTimeMs = Math.max(maxObservedWaitTimeMs, waitTimeMs);

  if (waitTimeMs >= waitLogThresholdMs) {
    console.warn(`PDF render waited ${waitTimeMs}ms for a free slot. Active=${activeRenders} Queue=${waitingResolvers.length}`);
  }
}

async function acquireSlot(): Promise<void> {
  totalRequests += 1;
  const enqueuedAt = Date.now();

  if (activeRenders < maxConcurrentRenders) {
    activeRenders += 1;
    recordWaitTime(Date.now() - enqueuedAt);
    return;
  }

  if (Number.isFinite(maxQueuedRenders) && waitingResolvers.length >= maxQueuedRenders) {
    totalRejected += 1;
    throw new HttpError(503, 'PDF renderer is overloaded. Please retry shortly.');
  }

  await new Promise<void>((resolve) => {
    waitingResolvers.push({
      resolve: () => {
        recordWaitTime(Date.now() - enqueuedAt);
        resolve();
      },
    });
  });
}

function releaseSlot(): void {
  activeRenders = Math.max(0, activeRenders - 1);
  const next = waitingResolvers.shift();

  if (next) {
    activeRenders += 1;
    next.resolve();
  }
}

export function getRenderQueueMetrics(): RenderQueueMetrics {
  const averageWaitTimeMs = totalRequests > totalRejected
    ? totalWaitTimeMs / Math.max(1, totalRequests - totalRejected)
    : 0;

  return {
    activeRenders,
    queuedRenders: waitingResolvers.length,
    maxConcurrentRenders,
    maxQueuedRenders: Number.isFinite(maxQueuedRenders) ? maxQueuedRenders : null,
    totalRequests,
    totalCompleted,
    totalRejected,
    totalWaitTimeMs,
    averageWaitTimeMs,
    maxObservedWaitTimeMs,
  };
}

export async function withRenderSlot<T>(task: Task<T>): Promise<T> {
  await acquireSlot();

  try {
    const result = await task();
    totalCompleted += 1;
    return result;
  } finally {
    releaseSlot();
  }
}
