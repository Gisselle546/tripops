import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

import { Comment } from './entities/comment.entity';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import { Vote } from './entities/vote.entity';

import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateProposalOptionDto } from './dto/create-proposal-option.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class CollabService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,

    @InjectRepository(ItineraryItem)
    private readonly itineraryItemsRepo: Repository<ItineraryItem>,

    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,

    @InjectRepository(Proposal)
    private readonly proposalsRepo: Repository<Proposal>,

    @InjectRepository(ProposalOption)
    private readonly optionsRepo: Repository<ProposalOption>,

    @InjectRepository(Vote)
    private readonly votesRepo: Repository<Vote>,
    private readonly eventsService: EventsService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  // -------- Comments --------

  async listComments(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    const comments = await this.commentsRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });

    return comments.map((c) => this.toCommentDto(c));
  }

  async createComment(userId: string, tripId: string, dto: CreateCommentDto) {
    await this.assertTripAccess(userId, tripId);

    if (dto.itineraryItemId) {
      // Prevent cross-trip item attachment
      const item = await this.itineraryItemsRepo.findOne({
        where: { id: dto.itineraryItemId, tripId },
      });
      if (!item)
        throw new NotFoundException('Itinerary item not found in this trip.');
    }

    const comment = await this.commentsRepo.save(
      this.commentsRepo.create({
        tripId,
        itineraryItemId: dto.itineraryItemId,
        body: dto.body,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.COMMENT_CREATED,
      aggregateId: comment.id,
      aggregateType: 'Comment',
      actorUserId: userId,
      tripId,
      data: { body: comment.body, itineraryItemId: comment.itineraryItemId },
    });

    return this.toCommentDto(comment);
  }

  // -------- Proposals --------

  async listProposals(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    // Fetch proposals + options + vote counts (efficient enough for MVP)
    const proposals = await this.proposalsRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });

    const proposalIds = proposals.map((p) => p.id);
    const options = proposalIds.length
      ? await this.optionsRepo.find({
          where: proposalIds.map((id) => ({ proposalId: id })),
        })
      : [];

    const optionIds = options.map((o) => o.id);
    const votes = optionIds.length
      ? await this.votesRepo.find({
          where: optionIds.map((id) => ({ optionId: id })),
        })
      : [];

    const votesByOption: Record<string, number> = {};
    for (const v of votes)
      votesByOption[v.optionId] = (votesByOption[v.optionId] ?? 0) + 1;

    const optionsByProposal: Record<string, ProposalOption[]> = {};
    for (const o of options) {
      optionsByProposal[o.proposalId] ||= [];
      optionsByProposal[o.proposalId].push(o);
    }

    return proposals.map((p) => ({
      ...this.toProposalDto(p),
      options: (optionsByProposal[p.id] ?? []).map((o) => ({
        ...this.toOptionDto(o),
        voteCount: votesByOption[o.id] ?? 0,
      })),
    }));
  }

  async createProposal(userId: string, tripId: string, dto: CreateProposalDto) {
    await this.assertTripAccess(userId, tripId);

    const proposal = await this.proposalsRepo.save(
      this.proposalsRepo.create({
        tripId,
        title: dto.title,
        description: dto.description,
        status: ProposalStatus.OPEN,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.PROPOSAL_CREATED,
      aggregateId: proposal.id,
      aggregateType: 'Proposal',
      actorUserId: userId,
      tripId,
      data: { title: proposal.title },
    });

    return this.toProposalDto(proposal);
  }

  async addOption(
    userId: string,
    tripId: string,
    proposalId: string,
    dto: CreateProposalOptionDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    // Membership-scoped fetch: proposal must be in this trip
    const proposal = await this.proposalsRepo.findOne({
      where: { id: proposalId, tripId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found.');

    if (proposal.status !== ProposalStatus.OPEN)
      throw new BadRequestException('Proposal is closed.');

    const option = await this.optionsRepo.save(
      this.optionsRepo.create({
        proposalId: proposal.id,
        label: dto.label,
        details: dto.details,
        url: dto.url,
        estimatedCost: dto.estimatedCost,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.PROPOSAL_OPTION_CREATED,
      aggregateId: option.id,
      aggregateType: 'ProposalOption',
      actorUserId: userId,
      tripId,
      data: { label: option.label, proposalId: proposal.id },
    });

    return this.toOptionDto(option);
  }

  // -------- Voting --------
  async vote(userId: string, tripId: string, optionId: string) {
    await this.assertTripAccess(userId, tripId);

    // Very important: ensure option belongs to a proposal in this trip
    const option = await this.optionsRepo
      .createQueryBuilder('o')
      .innerJoin(Proposal, 'p', 'p.id = o.proposalId AND p.tripId = :tripId', {
        tripId,
      })
      .where('o.id = :optionId', { optionId })
      .getOne();

    if (!option) throw new NotFoundException('Option not found.');

    const proposal = await this.proposalsRepo.findOne({
      where: { id: option.proposalId, tripId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found.');
    if (proposal.status !== ProposalStatus.OPEN)
      throw new BadRequestException('Proposal is closed.');

    // Upsert behavior: since uq_vote_option_user prevents duplicates, we can:
    // - check exists, if yes -> unvote toggle OR no-op.
    const existing = await this.votesRepo.findOne({
      where: { optionId, userId },
    });
    if (existing) {
      // Toggle off (common UX)
      await this.votesRepo.remove(existing);

      await this.eventsService.publish({
        type: DomainEvents.VOTE_TOGGLED,
        aggregateId: optionId,
        aggregateType: 'Vote',
        actorUserId: userId,
        tripId,
        data: { optionId, action: 'removed' },
      });

      return { optionId, voted: false };
    }

    await this.votesRepo.save(this.votesRepo.create({ optionId, userId }));

    await this.eventsService.publish({
      type: DomainEvents.VOTE_TOGGLED,
      aggregateId: optionId,
      aggregateType: 'Vote',
      actorUserId: userId,
      tripId,
      data: { optionId, action: 'cast' },
    });

    return { optionId, voted: true };
  }

  // -------- DTO mappers --------

  private toCommentDto(c: Comment) {
    return {
      id: c.id,
      tripId: c.tripId,
      itineraryItemId: c.itineraryItemId ?? null,
      body: c.body,
      createdByUserId: c.createdByUserId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private toProposalDto(p: Proposal) {
    return {
      id: p.id,
      tripId: p.tripId,
      title: p.title,
      description: p.description ?? null,
      status: p.status,
      createdByUserId: p.createdByUserId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private toOptionDto(o: ProposalOption) {
    return {
      id: o.id,
      proposalId: o.proposalId,
      label: o.label,
      details: o.details ?? null,
      url: o.url ?? null,
      estimatedCost: o.estimatedCost ?? null,
      createdByUserId: o.createdByUserId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
