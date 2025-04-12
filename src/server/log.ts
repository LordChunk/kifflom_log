interface LogStream {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiPayload {
  streams: LogStream[];
}

/**
 * Log class for sending logs to Grafana Loki
 */
export class Log {
  private url: string;
  private token: string;
  private defaultLabels: Record<string, string>;
  private enabled: boolean;
  private logBuffer: Map<string, { stream: Record<string, string>; values: [string, string][] }>;
  private flushInterval: NodeJS.Timeout | null;
  private flushTimeoutMs: number;

  /**
   * Constructor for Log class
   * @param url Loki API endpoint URL (injected from environment)
   * @param token Grafana Loki access token (optional)
   * @param defaultLabels Default labels to include with every log
   * @param flushTimeoutMs Time in milliseconds to wait before flushing logs (default: 2000ms)
   */
  constructor(
    url: string,
    token?: string,
    defaultLabels: Record<string, string> = { Language: 'NodeJS', source: 'Code' },
    flushTimeoutMs: number = 2000,
  ) {
    this.url = url;
    this.token = token || '';
    this.defaultLabels = defaultLabels;
    this.enabled = this.url !== '';
    this.logBuffer = new Map();
    this.flushInterval = null;
    this.flushTimeoutMs = flushTimeoutMs;

    if (!this.enabled) {
      console.warn('Logger initialized without proper URL. Logging to Grafana Loki is disabled.');
    } else {
      console.log('Logger initialized.');
      this.startFlushInterval();
    }
  }

  /**
   * Start the interval timer to flush logs periodically
   */
  private startFlushInterval(): void {
    if (this.flushInterval === null) {
      this.flushInterval = setInterval(() => {
        this.flushLogs();
      }, this.flushTimeoutMs);
    }
  }

  /**
   * Stop the flush interval timer
   */
  public stopFlushInterval(): void {
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Convert current timestamp to nanoseconds string format required by Loki
   */
  private getTimestampNs(): string {
    return (Math.floor(Date.now() / 1000) * 1000000000).toString();
  }

  /**
   * Convert a message to string format
   */
  private stringifyMessage(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  /**
   * Get a unique key to represent a set of labels
   */
  private getLabelsKey(labels: Record<string, string>): string {
    return JSON.stringify(labels);
  }

  /**
   * Add a log message to the buffer
   */
  private bufferLog(message: string, labels: Record<string, string>): void {
    const key = this.getLabelsKey(labels);

    if (!this.logBuffer.has(key)) {
      this.logBuffer.set(key, {
        stream: labels,
        values: []
      });
    }

    const stream = this.logBuffer.get(key)!;
    stream.values.push([this.getTimestampNs(), message]);
  }

  /**
   * Flush all buffered logs to Loki
   */
  async flushLogs(): Promise<void> {
    if (!this.enabled || this.logBuffer.size === 0) {
      return;
    }

    try {
      const payload: LokiPayload = {
        streams: Array.from(this.logBuffer.values())
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists and isn't empty
      if (this.token && this.token.trim() !== '') {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }

      this.logBuffer.clear();
    } catch (error) {
      console.error('Failed to send aggregated logs to Loki:', error);
    }
  }

  /**
   * Send a log message to Loki
   * @param message Log message to send
   * @param additionalLabels Additional labels to include with this log
   */
  async log(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    if (!this.enabled) {
      console.warn('Logger is disabled. Skipping log message:', message);
      return;
    }

    const labels = { ...this.defaultLabels, ...additionalLabels };
    const stringMessage = this.stringifyMessage(message);

    // Add the log to the buffer instead of sending immediately
    this.bufferLog(stringMessage, labels);
  }

  /**
   * Convenience method for sending info level logs
   */
  async info(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    return this.log(message, { ...additionalLabels, level: 'info' });
  }

  /**
   * Convenience method for sending warning level logs
   */
  async warn(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    return this.log(message, { ...additionalLabels, level: 'warn' });
  }

  /**
   * Convenience method for sending error level logs
   */
  async error(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    return this.log(message, { ...additionalLabels, level: 'error' });
  }

  /**
   * Convenience method for sending debug level logs
   */
  async debug(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    return this.log(message, { ...additionalLabels, level: 'debug' });
  }

  /**
   * Manually force all pending logs to be sent immediately
   */
  async flush(): Promise<void> {
    return this.flushLogs();
  }
}