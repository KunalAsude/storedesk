/** Injectable time source so tests can move time forward (lockouts, token expiry). */
export interface Clock {
  now(): Date;
}

export const CLOCK = Symbol("CLOCK");

export const systemClock: Clock = { now: () => new Date() };
