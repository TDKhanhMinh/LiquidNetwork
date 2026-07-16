export interface IInvitationTimeoutScheduler {
  schedule(
    queueId: string,
    generation: number,
    delayMs: number,
  ): Promise<void>;

  cancel(queueId: string, generation: number): Promise<void>;
}
