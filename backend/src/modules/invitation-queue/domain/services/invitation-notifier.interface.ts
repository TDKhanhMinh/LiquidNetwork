import { IInvitationQueue } from '../entities/invitation-queue.entity';

export interface IInvitationNotifier {
  onQueueUpdated(queue: IInvitationQueue): Promise<void>;
  onYourTurn(queue: IInvitationQueue, inviteeUserId: string): Promise<void>;
  onCompleted(queue: IInvitationQueue): Promise<void>;
  onCancelled(queue: IInvitationQueue): Promise<void>;
}
