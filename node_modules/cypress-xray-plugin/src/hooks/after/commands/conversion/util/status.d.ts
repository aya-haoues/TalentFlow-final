/**
 * Converts the given Cucumber status to an Xray status. Returns the original status if no matching
 * custom status is specified.
 *
 * @param state - the status text
 * @param options - optional custom statuses
 * @returns the Xray status
 */
export declare function getXrayStatus(status: string, statusOptions?: {
    failed?: string;
    passed?: string;
    pending?: string;
    skipped?: string;
}): string;
