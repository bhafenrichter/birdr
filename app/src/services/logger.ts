export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

type ErrorReporter = (event: string, properties?: Record<string, any>) => void;

let _errorReporter: ErrorReporter | null = null;

/** Call from PostHogProvider to wire up error reporting. */
export function setErrorReporter(reporter: ErrorReporter) {
  _errorReporter = reporter;
}

class ConsoleLogger implements Logger {
  info(message: string, ...args: unknown[]) {
    console.log(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[ERROR] ${message}`, ...args);
    if (_errorReporter) {
      _errorReporter("app_error", {
        message,
        details: args.length === 1 && typeof args[0] === "object" ? args[0] : args,
      });
    }
  }
}

export const logger: Logger = new ConsoleLogger();
