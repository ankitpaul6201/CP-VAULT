const PREFIX = '[CP Vault]';

export const Logger = {
  info(message: string, ...optionalParams: unknown[]) {
    console.log(`%c${PREFIX} INFO:`, 'color: #3b82f6; font-weight: bold;', message, ...optionalParams);
  },
  warn(message: string, ...optionalParams: unknown[]) {
    console.warn(`%c${PREFIX} WARN:`, 'color: #f59e0b; font-weight: bold;', message, ...optionalParams);
  },
  error(message: string, ...optionalParams: unknown[]) {
    console.error(`%c${PREFIX} ERROR:`, 'color: #ef4444; font-weight: bold;', message, ...optionalParams);
  },
  success(message: string, ...optionalParams: unknown[]) {
    console.log(`%c${PREFIX} SUCCESS:`, 'color: #10b981; font-weight: bold;', message, ...optionalParams);
  }
};
