export const INVITATION_TIMEOUT_QUEUE = 'invitation-timeout';
export const INVITE_WINDOW_EXPIRED_JOB = 'invite-window-expired';

export function invitationTimeoutJobId(
  queueId: string,
  generation: number,
): string {
  return `iq-timeout:${queueId}:${generation}`;
}
