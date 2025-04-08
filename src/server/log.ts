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
  
  /**
   * Constructor for Log class
   * @param token Grafana Loki access token (injected from environment)
   * @param defaultLabels Default labels to include with every log
   * @param url Loki API endpoint URL (injected from environment)
   */
  constructor(
    token: string,
    url: string,
    defaultLabels: Record<string, string> = { Language: 'NodeJS', source: 'Code' },
  ) {
    this.url = url;
    this.token = token;
    this.defaultLabels = defaultLabels;
    this.enabled = Boolean(this.url && this.token);
    
    if (!this.enabled)
      console.warn('Logger initialized without proper credentials. Logging to Grafana Loki is disabled.');
    else
      console.log('Logger initialized.');
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
   * Send a log message to Loki
   * @param message Log message to send
   * @param additionalLabels Additional labels to include with this log
   */
  async log(message: unknown, additionalLabels: Record<string, string> = {}): Promise<void> {
    if (!this.enabled) {
      console.warn('Logger is disabled. Skipping log message:', message);
      return;
    }
    
    try {
      const labels = { ...this.defaultLabels, ...additionalLabels };
      const stringMessage = this.stringifyMessage(message);
      
      const payload: LokiPayload = {
        streams: [
          {
            stream: labels,
            values: [
              [this.getTimestampNs(), stringMessage]
            ]
          }
        ]
      };
      
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Failed to send log to Loki:', error);
    }
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
}