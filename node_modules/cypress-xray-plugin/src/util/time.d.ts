/**
 * Remove milliseconds from ISO time string.
 *
 * @param time - a date time string in ISO format
 * @returns the truncated date time string
 * @example
 *   const time = truncateISOTime("2022-12-01T02:30:44.744Z")
 *   console.log(time); // "2022-12-01T02:30:44Z"
 */
export declare function truncateIsoTime(time: string): string;
/**
 * Starts an informative timer which ticks in a predefined interval.
 *
 * @param onTick - the function to call on each interval tick
 * @returns the timer's handler
 */
export declare function startInterval(onTick: (totalTime: number) => void): ReturnType<typeof setInterval>;
/**
 * Returns the earliest date of all specified dates.
 *
 * @param dates - the dates
 * @returns the earliest date
 */
export declare function earliestDate(...dates: Date[]): Date;
/**
 * Returns the latest date of all specified dates.
 *
 * @param dates - the dates
 * @returns the latest date
 */
export declare function latestDate(...dates: Date[]): Date;
