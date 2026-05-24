// Tracks whether startup migrations have completed. /healthz stays non-200
// until this flips to true.
let migrationsComplete = false;

export const setMigrationsComplete = (value: boolean): void => {
  migrationsComplete = value;
};

export const areMigrationsComplete = (): boolean => migrationsComplete;
