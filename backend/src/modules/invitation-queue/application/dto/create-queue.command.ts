export interface CreateQueueCommand {
  hostId: string;
  title?: string;
  message?: string;
  timeoutSeconds: number;
  inviteeIds: string[];
}
