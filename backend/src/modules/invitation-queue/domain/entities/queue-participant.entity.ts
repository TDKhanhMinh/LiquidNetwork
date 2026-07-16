import { ParticipantStatus } from '../enums/participant-status.enum';

export interface IQueueParticipant {
  userId: string;
  name: string;
  avatar?: string;
  alcoholToleranceLevel?: string;
  occupation?: string;
  order: number;
  status: ParticipantStatus;
  invitedAt?: Date | null;
  respondedAt?: Date | null;
}
