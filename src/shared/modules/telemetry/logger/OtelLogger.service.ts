import { ConsoleLogger, Injectable } from '@nestjs/common';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const SEVERITY: Record<string, SeverityNumber> = {
  log: SeverityNumber.INFO,
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  debug: SeverityNumber.DEBUG,
  verbose: SeverityNumber.TRACE,
  fatal: SeverityNumber.FATAL,
};

@Injectable()
export class OtelLoggerService extends ConsoleLogger {
  private readonly otelLogger = logs.getLogger('nestjs');

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    this.emit('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
    this.emit('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    this.emit('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams);
    this.emit('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams);
    this.emit('verbose', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    super.fatal(message, ...optionalParams);
    this.emit('fatal', message, optionalParams);
  }

  private emit(level: string, message: any, params: any[]) {
    const context =
      typeof params[params.length - 1] === 'string'
        ? params[params.length - 1]
        : undefined;

    this.otelLogger.emit({
      severityNumber: SEVERITY[level] ?? SeverityNumber.INFO,
      body: typeof message === 'string' ? message : JSON.stringify(message),
      attributes: context ? { 'nestjs.context': context } : {},
    });
  }
}
