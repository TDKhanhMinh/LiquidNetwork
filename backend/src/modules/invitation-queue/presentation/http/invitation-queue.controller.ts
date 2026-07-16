import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CreateQueueUseCase } from '../../application/use-cases/create-queue.use-case';
import { GetMyActiveQueueUseCase } from '../../application/use-cases/get-my-active-queue.use-case';
import { GetQueueByIdUseCase } from '../../application/use-cases/get-queue-by-id.use-case';
import { RespondToQueueUseCase } from '../../application/use-cases/respond-to-queue.use-case';
import { CancelQueueUseCase } from '../../application/use-cases/cancel-queue.use-case';
import { GetQueueHistoryUseCase } from '../../application/use-cases/get-queue-history.use-case';
import { GetInvitationByIdUseCase } from '../../application/use-cases/get-invitation-by-id.use-case';
import { SearchCandidatesUseCase } from '../../application/use-cases/search-candidates.use-case';
import { ListCandidateSuggestionsUseCase } from '../../application/use-cases/list-candidate-suggestions.use-case';
import {
  CREATE_QUEUE_THROTTLE_LIMIT,
  CREATE_QUEUE_THROTTLE_TTL_MS,
  RESPOND_QUEUE_THROTTLE_LIMIT,
  RESPOND_QUEUE_THROTTLE_TTL_MS,
} from '../../domain/constants/queue.constants';
import { CreateQueueRequestDto } from '../dtos/create-queue-request.dto';
import { RespondQueueRequestDto } from '../dtos/respond-queue-request.dto';
import { InvitationQueueResponseDto } from '../dtos/invitation-queue-response.dto';
import {
  InvitationResponseDto,
  QueueHistoryResponseDto,
} from '../dtos/invitation-response.dto';
import { QueueUserRefDto } from '../dtos/queue-user-ref.dto';
import { OffsetPaginationDto } from '../../../../shared/common/pagination/dto/offset-pagination.dto';

@ApiTags('Invitation Queue')
@ApiBearerAuth('JWT-auth')
@Controller('invitation-queue')
@UseGuards(JwtAuthGuard)
export class InvitationQueueController {
  constructor(
    private readonly createQueue: CreateQueueUseCase,
    private readonly getMyActiveQueue: GetMyActiveQueueUseCase,
    private readonly getQueueById: GetQueueByIdUseCase,
    private readonly respondToQueue: RespondToQueueUseCase,
    private readonly cancelQueue: CancelQueueUseCase,
    private readonly getHistory: GetQueueHistoryUseCase,
    private readonly getInvitationById: GetInvitationByIdUseCase,
    private readonly searchCandidates: SearchCandidatesUseCase,
    private readonly listSuggestions: ListCandidateSuggestionsUseCase,
  ) {}

  @Post()
  @Throttle({
    default: {
      limit: CREATE_QUEUE_THROTTLE_LIMIT,
      ttl: CREATE_QUEUE_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({ summary: 'Create and start a sequential invitation queue' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit: 10 creates per hour per user (code RATE_LIMIT_EXCEEDED)',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateQueueRequestDto,
  ) {
    const queue = await this.createQueue.execute({
      hostId: userId,
      title: body.title,
      message: body.message,
      timeoutSeconds: body.timeoutSeconds,
      inviteeIds: body.inviteeIds,
    });
    return new InvitationQueueResponseDto(queue);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get host active invitation queue (or null)' })
  async me(@CurrentUser('id') userId: string) {
    const queue = await this.getMyActiveQueue.execute(userId);
    return queue ? new InvitationQueueResponseDto(queue) : null;
  }

  @Get('history')
  @ApiOperation({
    summary: 'Invitation history (sent / received)',
    description:
      'Optional offset pagination via page/limit. Response keeps { sent, received } and adds optional meta.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async history(
    @CurrentUser('id') userId: string,
    @Query() query: OffsetPaginationDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const result = await this.getHistory.execute(userId, page, limit);
    return new QueueHistoryResponseDto(result.sent, result.received, {
      page: result.page,
      limit: result.limit,
      sentTotal: result.sentTotal,
      receivedTotal: result.receivedTotal,
    });
  }

  @Get('candidates/suggestions')
  @ApiOperation({ summary: 'Suggested candidates for a new queue' })
  async suggestions(@CurrentUser('id') userId: string) {
    const list = await this.listSuggestions.execute(userId);
    return list.map((r) => new QueueUserRefDto(r));
  }

  @Get('candidates')
  @ApiOperation({ summary: 'Search candidates by name / occupation' })
  @ApiQuery({ name: 'q', required: false })
  async candidates(
    @CurrentUser('id') userId: string,
    @Query('q') q?: string,
  ) {
    const list = await this.searchCandidates.execute(userId, q ?? '');
    return list.map((r) => new QueueUserRefDto(r));
  }

  @Get('invitations/:invitationId')
  @ApiOperation({ summary: 'Get a flat invitation by id' })
  async invitationDetail(
    @CurrentUser('id') userId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const inv = await this.getInvitationById.execute(invitationId, userId);
    const direction =
      inv.fromUserId === userId
        ? 'sent'
        : inv.toUserId === userId
          ? 'received'
          : undefined;
    return new InvitationResponseDto(inv, direction);
  }

  @Get(':queueId')
  @ApiOperation({ summary: 'Get invitation queue by id' })
  async getById(
    @CurrentUser('id') userId: string,
    @Param('queueId') queueId: string,
  ) {
    const queue = await this.getQueueById.execute(queueId, userId);
    return new InvitationQueueResponseDto(queue);
  }

  @Post(':queueId/respond')
  @Throttle({
    default: {
      limit: RESPOND_QUEUE_THROTTLE_LIMIT,
      ttl: RESPOND_QUEUE_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({ summary: 'Current invitee accepts or rejects' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit: 30 responds per minute per user (code RATE_LIMIT_EXCEEDED)',
  })
  async respond(
    @CurrentUser('id') userId: string,
    @Param('queueId') queueId: string,
    @Body() body: RespondQueueRequestDto,
  ) {
    const queue = await this.respondToQueue.execute({
      queueId,
      actorUserId: userId,
      accept: body.accept,
    });
    return new InvitationQueueResponseDto(queue);
  }

  @Post(':queueId/cancel')
  @ApiOperation({ summary: 'Host cancels the active queue' })
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('queueId') queueId: string,
  ) {
    const queue = await this.cancelQueue.execute(queueId, userId);
    return new InvitationQueueResponseDto(queue);
  }

  @Delete(':queueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel active queue (host only)',
    description:
      'Same as POST /:queueId/cancel. Host only — invitees receive 403 FORBIDDEN_QUEUE_ACCESS. Invitees should use POST /respond with accept=false instead.',
  })
  async leave(
    @CurrentUser('id') userId: string,
    @Param('queueId') queueId: string,
  ) {
    await this.cancelQueue.execute(queueId, userId);
  }
}
