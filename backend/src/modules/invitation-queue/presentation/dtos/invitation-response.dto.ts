import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IInvitation } from '../../domain/entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  queueId: string;

  @ApiProperty()
  fromUserId: string;

  @ApiProperty()
  fromUserName: string;

  @ApiPropertyOptional()
  fromUserAvatar?: string;

  @ApiProperty()
  toUserId: string;

  @ApiProperty()
  toUserName: string;

  @ApiPropertyOptional()
  toUserAvatar?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty()
  timeoutSeconds: number;

  @ApiPropertyOptional({ nullable: true })
  expiresAt?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional({ nullable: true })
  respondedAt?: string | null;

  @ApiPropertyOptional({ enum: ['sent', 'received'] })
  direction?: 'sent' | 'received';

  constructor(inv: IInvitation, direction?: 'sent' | 'received') {
    this.id = String(inv._id);
    this.queueId = inv.queueId;
    this.fromUserId = inv.fromUserId;
    this.fromUserName = inv.fromUserName;
    this.fromUserAvatar = inv.fromUserAvatar;
    this.toUserId = inv.toUserId;
    this.toUserName = inv.toUserName;
    this.toUserAvatar = inv.toUserAvatar;
    this.status = inv.status;
    this.message = inv.message;
    this.timeoutSeconds = inv.timeoutSeconds;
    this.expiresAt = inv.expiresAt
      ? new Date(inv.expiresAt).toISOString()
      : null;
    this.createdAt = inv.createdAt
      ? new Date(inv.createdAt).toISOString()
      : new Date().toISOString();
    this.respondedAt = inv.respondedAt
      ? new Date(inv.respondedAt).toISOString()
      : null;
    this.direction = direction;
  }
}

export class QueueHistoryMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  sentTotal: number;

  @ApiProperty()
  receivedTotal: number;
}

export class QueueHistoryResponseDto {
  @ApiProperty({ type: [InvitationResponseDto] })
  sent: InvitationResponseDto[];

  @ApiProperty({ type: [InvitationResponseDto] })
  received: InvitationResponseDto[];

  /** Optional pagination meta — FE may ignore */
  @ApiPropertyOptional({ type: QueueHistoryMetaDto })
  meta?: QueueHistoryMetaDto;

  constructor(
    sent: IInvitation[],
    received: IInvitation[],
    meta?: {
      page: number;
      limit: number;
      sentTotal: number;
      receivedTotal: number;
    },
  ) {
    this.sent = sent.map((i) => new InvitationResponseDto(i, 'sent'));
    this.received = received.map(
      (i) => new InvitationResponseDto(i, 'received'),
    );
    if (meta) {
      this.meta = {
        page: meta.page,
        limit: meta.limit,
        sentTotal: meta.sentTotal,
        receivedTotal: meta.receivedTotal,
      };
    }
  }
}
