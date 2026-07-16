import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { IQueueParticipant } from '../../domain/entities/queue-participant.entity';

export class QueueParticipantResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  alcoholToleranceLevel?: string;

  @ApiPropertyOptional()
  occupation?: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ nullable: true })
  invitedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  respondedAt?: string | null;

  constructor(p: IQueueParticipant) {
    this.userId = p.userId;
    this.name = p.name;
    this.avatar = p.avatar;
    this.alcoholToleranceLevel = p.alcoholToleranceLevel;
    this.occupation = p.occupation;
    this.order = p.order;
    this.status = p.status;
    this.invitedAt = p.invitedAt ? new Date(p.invitedAt).toISOString() : null;
    this.respondedAt = p.respondedAt
      ? new Date(p.respondedAt).toISOString()
      : null;
  }
}

export class InvitationQueueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  hostId: string;

  @ApiProperty()
  hostName: string;

  @ApiPropertyOptional()
  hostAvatar?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  timeoutSeconds: number;

  @ApiProperty()
  currentIndex: number;

  @ApiProperty({ type: [QueueParticipantResponseDto] })
  participants: QueueParticipantResponseDto[];

  @ApiPropertyOptional({ nullable: true })
  expiresAt?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  updatedAt?: string;

  @ApiPropertyOptional({ nullable: true })
  completedAt?: string | null;

  constructor(queue: IInvitationQueue) {
    this.id = String(queue._id);
    this.hostId = queue.hostId;
    this.hostName = queue.hostName;
    this.hostAvatar = queue.hostAvatar;
    this.title = queue.title;
    this.message = queue.message;
    this.status = queue.status;
    this.timeoutSeconds = queue.timeoutSeconds;
    this.currentIndex = queue.currentIndex;
    this.participants = (queue.participants ?? []).map(
      (p) => new QueueParticipantResponseDto(p),
    );
    this.expiresAt = queue.expiresAt
      ? new Date(queue.expiresAt).toISOString()
      : null;
    this.createdAt = queue.createdAt
      ? new Date(queue.createdAt).toISOString()
      : new Date().toISOString();
    this.updatedAt = queue.updatedAt
      ? new Date(queue.updatedAt).toISOString()
      : undefined;
    this.completedAt = queue.completedAt
      ? new Date(queue.completedAt).toISOString()
      : null;
  }
}
