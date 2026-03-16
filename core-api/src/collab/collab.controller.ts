import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user';

import { CollabService } from './collab.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateProposalOptionDto } from './dto/create-proposal-option.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CollabController {
  constructor(private readonly collab: CollabService) {}

  // ---- Comments ----
  @Get('trips/:tripId/comments')
  listComments(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
  ) {
    return this.collab.listComments(req.user.userId, tripId);
  }

  @Post('trips/:tripId/comments')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  createComment(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.collab.createComment(req.user.userId, tripId, dto);
  }

  // ---- Proposals ----
  @Get('trips/:tripId/proposals')
  listProposals(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
  ) {
    return this.collab.listProposals(req.user.userId, tripId);
  }

  @Post('trips/:tripId/proposals')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  createProposal(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.collab.createProposal(req.user.userId, tripId, dto);
  }

  @Post('trips/:tripId/proposals/:proposalId/options')
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  addOption(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @Body() dto: CreateProposalOptionDto,
  ) {
    return this.collab.addOption(req.user.userId, tripId, proposalId, dto);
  }

  // ---- Votes ----
  @Post('trips/:tripId/options/:optionId/vote')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  vote(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('optionId') optionId: string,
  ) {
    return this.collab.vote(req.user.userId, tripId, optionId);
  }
}
