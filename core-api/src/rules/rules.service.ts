import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

import { RuleSet } from './entities/rule-set.entity';
import { Rule, RuleType } from './entities/rule.entity';
import { RuleEvaluation } from './entities/rule-evaluation.entity';
import { UpsertRuleSetDto } from './dto/upsert-rule-set.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,

    @InjectRepository(ItineraryItem)
    private readonly itineraryItemsRepo: Repository<ItineraryItem>,

    @InjectRepository(RuleSet)
    private readonly ruleSetsRepo: Repository<RuleSet>,

    @InjectRepository(Rule)
    private readonly rulesRepo: Repository<Rule>,

    @InjectRepository(RuleEvaluation)
    private readonly evalRepo: Repository<RuleEvaluation>,
    private readonly eventsService: EventsService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  async getRuleSet(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    const rs = await this.ruleSetsRepo.findOne({ where: { tripId } });
    if (!rs) return { tripId, ruleSet: null };

    const rules = await this.rulesRepo.find({
      where: { ruleSetId: rs.id },
      order: { createdAt: 'ASC' },
    });
    return {
      tripId,
      ruleSet: {
        id: rs.id,
        name: rs.name,
        isActive: rs.isActive,
        rules: rules.map((r) => ({
          id: r.id,
          type: r.type,
          enabled: r.enabled,
          params: r.params ?? {},
          note: r.note ?? null,
        })),
      },
    };
  }

  async upsertRuleSet(userId: string, tripId: string, dto: UpsertRuleSetDto) {
    await this.assertTripAccess(userId, tripId);

    let rs = await this.ruleSetsRepo.findOne({ where: { tripId } });
    if (!rs) {
      rs = await this.ruleSetsRepo.save(
        this.ruleSetsRepo.create({
          tripId,
          name: dto.name ?? 'Default Rules',
          isActive: dto.isActive ?? true,
        }),
      );
    } else {
      if (dto.name !== undefined) rs.name = dto.name;
      if (dto.isActive !== undefined) rs.isActive = dto.isActive;
      rs = await this.ruleSetsRepo.save(rs);
    }

    // Replace all rules for simplicity (MVP)
    await this.rulesRepo.delete({ ruleSetId: rs.id });

    const toInsert = dto.rules.map((r) =>
      this.rulesRepo.create({
        ruleSetId: rs.id,
        type: r.type,
        enabled: r.enabled ?? true,
        params: r.params ?? {},
        note: r.note,
      }),
    );

    const savedRules = await this.rulesRepo.save(toInsert);

    await this.eventsService.publish({
      type: DomainEvents.RULESET_UPSERTED,
      aggregateId: rs.id,
      aggregateType: 'RuleSet',
      actorUserId: userId,
      tripId,
      data: { name: rs.name, ruleCount: savedRules.length },
    });

    return {
      tripId,
      ruleSet: {
        id: rs.id,
        name: rs.name,
        isActive: rs.isActive,
        rules: savedRules.map((r) => ({
          id: r.id,
          type: r.type,
          enabled: r.enabled,
          params: r.params ?? {},
          note: r.note ?? null,
        })),
      },
    };
  }

  // ---- Evaluation: start simple (evaluate an itinerary item)
  async evaluateItineraryItem(
    userId: string,
    tripId: string,
    itineraryItemId: string,
  ) {
    await this.assertTripAccess(userId, tripId);

    const item = await this.itineraryItemsRepo.findOne({
      where: { id: itineraryItemId, tripId },
    });
    if (!item)
      throw new NotFoundException('Itinerary item not found in this trip.');

    const rs = await this.ruleSetsRepo.findOne({ where: { tripId } });
    if (!rs) {
      return { passed: true, violations: [], note: 'No rule set configured.' };
    }

    const rules = await this.rulesRepo.find({ where: { ruleSetId: rs.id } });

    const violations: Array<{
      ruleType: string;
      message: string;
      severity?: 'WARN' | 'BLOCK';
    }> = [];

    // MVP: only enforce rules that can apply to itinerary items now.
    // (Flights/hotels get richer later; this still showcases “rules engine”.)
    for (const rule of rules) {
      if (!rule.enabled) continue;

      switch (rule.type) {
        case RuleType.VEG_ONLY: {
          // applies if item is RESTAURANT, and we store a hint in params or item title/notes later.
          if (item.type === 'RESTAURANT') {
            const isVeg = Boolean((rule.params ?? {}).assumeAllRestaurantsVeg); // placeholder
            if (!isVeg) {
              violations.push({
                ruleType: rule.type,
                message:
                  'Restaurant must be vegetarian-friendly (rule: VEG_ONLY).',
                severity: 'WARN',
              });
            }
          }
          break;
        }

        case RuleType.BUDGET_MAX_PER_PERSON: {
          const max = Number((rule.params ?? {}).max);
          if (
            Number.isFinite(max) &&
            item.estimatedCost != null &&
            item.estimatedCost > max
          ) {
            violations.push({
              ruleType: rule.type,
              message: `Estimated cost ${item.estimatedCost} exceeds budget max ${max}.`,
              severity: 'WARN',
            });
          }
          break;
        }

        // These are “ready” for later when you add flight/hotel structured fields.
        case RuleType.NO_REDEYE:
        case RuleType.MAX_LAYOVERS:
        case RuleType.DAILY_WALKING_CAP_KM:
        default:
          // no-op in MVP evaluation
          break;
      }
    }

    const passed = violations.every((v) => v.severity !== 'BLOCK');

    // Store evaluation record (good for audit-like credibility)
    await this.evalRepo.save(
      this.evalRepo.create({
        tripId,
        ruleSetId: rs.id,
        targetType: 'ITINERARY_ITEM',
        targetId: itineraryItemId,
        result: { passed, violations },
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.RULES_EVALUATED,
      aggregateId: itineraryItemId,
      aggregateType: 'ItineraryItem',
      actorUserId: userId,
      tripId,
      data: { passed, results: violations },
    });

    return { passed, violations };
  }
}
