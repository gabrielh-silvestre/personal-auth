export type TelemetryShutdown = () => Promise<void>;

const KEY = Symbol.for('personal-auth.telemetry.shutdown');

type GlobalSlot = { [k: symbol]: TelemetryShutdown | undefined };

const slot = globalThis as unknown as GlobalSlot;

export const setTelemetryShutdown = (fn: TelemetryShutdown): void => {
  slot[KEY] = fn;
};

export const getTelemetryShutdown = (): TelemetryShutdown | undefined =>
  slot[KEY];

export const clearTelemetryShutdown = (): void => {
  slot[KEY] = undefined;
};
