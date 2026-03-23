import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Entities
import { User } from './users/entities/user.entity';
import { Workspace } from './workspace/entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from './workspace/entities/workspace-member.entity';
import { Trip } from './trips/entities/trip.entity';
import {
  TripMember,
  TripRole,
  TripMemberStatus,
} from './trips/entities/trip-member.entity';
import {
  Booking,
  BookingType,
  BookingStatus,
} from './bookings/entities/booking.entity';
import { ItineraryDay } from './itinerary/entities/itinerary-day.entity';
import {
  ItineraryItem,
  ItineraryItemType,
  ItineraryItemStatus,
} from './itinerary/entities/itinerary-item.entity';
import { Proposal, ProposalStatus } from './collab/entities/proposal.entity';
import { ProposalOption } from './collab/entities/proposal-option.entity';
import { Vote } from './collab/entities/vote.entity';
import { Comment } from './collab/entities/comment.entity';
import { Task, TaskStatus } from './tasks/entities/task.entity';
import {
  Notification,
  NotificationType,
  NotificationChannel,
} from './notifications/entities/notification.entity';
import {
  Document,
  DocumentCategory,
} from './documents/entities/document.entity';
import { RuleSet } from './rules/entities/rule-set.entity';
import { Rule, RuleType } from './rules/entities/rule.entity';
import { AuditLog, AuditAction } from './audit/entities/audit-log.entity';
import {
  OutboxEvent,
  OutboxStatus,
} from './events/entities/outbox-event.entity';
import {
  DisruptionEvent,
  DisruptionType,
} from './rebooking/entities/disruption-event.entity';
import {
  RebookingCase,
  RebookingCaseStatus,
} from './rebooking/entities/rebooking-case.entity';
import { RebookingOption } from './rebooking/entities/rebooking-option.entity';
import { Auth } from './auth/entities/auth.entity';
import { TripInvite } from './trips/entities/trip-invite.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tripops',
  entities: [
    User,
    Auth,
    Workspace,
    WorkspaceMember,
    Trip,
    TripMember,
    TripInvite,
    Booking,
    ItineraryDay,
    ItineraryItem,
    Proposal,
    ProposalOption,
    Vote,
    Comment,
    Task,
    Notification,
    Document,
    RuleSet,
    Rule,
    AuditLog,
    OutboxEvent,
    DisruptionEvent,
    RebookingCase,
    RebookingOption,
  ],
  synchronize: true,
});

async function seed() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Connected\n');

  const userRepo = AppDataSource.getRepository(User);
  const workspaceRepo = AppDataSource.getRepository(Workspace);
  const workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMember);
  const tripRepo = AppDataSource.getRepository(Trip);
  const tripMemberRepo = AppDataSource.getRepository(TripMember);
  const bookingRepo = AppDataSource.getRepository(Booking);
  const dayRepo = AppDataSource.getRepository(ItineraryDay);
  const itemRepo = AppDataSource.getRepository(ItineraryItem);
  const proposalRepo = AppDataSource.getRepository(Proposal);
  const optionRepo = AppDataSource.getRepository(ProposalOption);
  const voteRepo = AppDataSource.getRepository(Vote);
  const commentRepo = AppDataSource.getRepository(Comment);
  const taskRepo = AppDataSource.getRepository(Task);
  const notifRepo = AppDataSource.getRepository(Notification);
  const docRepo = AppDataSource.getRepository(Document);
  const ruleSetRepo = AppDataSource.getRepository(RuleSet);
  const ruleRepo = AppDataSource.getRepository(Rule);
  const auditRepo = AppDataSource.getRepository(AuditLog);
  const disruptionRepo = AppDataSource.getRepository(DisruptionEvent);
  const rebookingCaseRepo = AppDataSource.getRepository(RebookingCase);
  const rebookingOptionRepo = AppDataSource.getRepository(RebookingOption);

  // ──────────────────────────────────────────────
  // 1. Users (password: "Password1!")
  // ──────────────────────────────────────────────
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('Password1!', 12);

  const sarah = userRepo.create({
    email: 'sarah@tripops.dev',
    fullName: 'Sarah Johnson',
    passwordHash,
  });
  const alex = userRepo.create({
    email: 'alex@tripops.dev',
    fullName: 'Alex Chen',
    passwordHash,
  });
  const maria = userRepo.create({
    email: 'maria@tripops.dev',
    fullName: 'Maria Garcia',
    passwordHash,
  });
  const james = userRepo.create({
    email: 'james@tripops.dev',
    fullName: 'James Wilson',
    passwordHash,
  });

  const [u1, u2, u3, u4] = await userRepo.save([sarah, alex, maria, james]);
  console.log(`  Created ${4} users\n`);

  // ──────────────────────────────────────────────
  // 2. Workspaces
  // ──────────────────────────────────────────────
  console.log('🏢 Creating workspaces...');
  const workspace1 = workspaceRepo.create({
    name: 'Paris Getaway',
    description: 'Team trip to Paris — April 2026',
    coverImage:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  });
  const workspace2 = workspaceRepo.create({
    name: 'Tokyo Adventure',
    description: 'Company retreat to Tokyo — June 2026',
    coverImage:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
  });
  const [ws1, ws2] = await workspaceRepo.save([workspace1, workspace2]);

  // Workspace members
  await workspaceMemberRepo.save([
    workspaceMemberRepo.create({
      workspaceId: ws1.id,
      userId: u1.id,
      role: WorkspaceRole.OWNER,
    }),
    workspaceMemberRepo.create({
      workspaceId: ws1.id,
      userId: u2.id,
      role: WorkspaceRole.ADMIN,
    }),
    workspaceMemberRepo.create({
      workspaceId: ws1.id,
      userId: u3.id,
      role: WorkspaceRole.MEMBER,
    }),
    workspaceMemberRepo.create({
      workspaceId: ws1.id,
      userId: u4.id,
      role: WorkspaceRole.MEMBER,
    }),
    workspaceMemberRepo.create({
      workspaceId: ws2.id,
      userId: u1.id,
      role: WorkspaceRole.OWNER,
    }),
    workspaceMemberRepo.create({
      workspaceId: ws2.id,
      userId: u2.id,
      role: WorkspaceRole.MEMBER,
    }),
  ]);
  console.log(`  Created 2 workspaces with members\n`);

  // ──────────────────────────────────────────────
  // 3. Trips
  // ──────────────────────────────────────────────
  console.log('🏝️ Creating trips...');
  const trip1 = tripRepo.create({
    workspaceId: ws1.id,
    title: 'Paris Spring Break',
    destination: 'Paris, France',
    startDate: '2026-04-10',
    endDate: '2026-04-17',
    budgetTarget: 500000, // $5,000 in cents
    coverImage:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    createdByUserId: u1.id,
  });
  const trip2 = tripRepo.create({
    workspaceId: ws2.id,
    title: 'Tokyo Team Retreat',
    destination: 'Tokyo, Japan',
    startDate: '2026-06-15',
    endDate: '2026-06-22',
    budgetTarget: 800000, // $8,000 in cents
    coverImage:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
    createdByUserId: u1.id,
  });
  const [t1, t2] = await tripRepo.save([trip1, trip2]);

  // Trip members
  await tripMemberRepo.save([
    tripMemberRepo.create({
      tripId: t1.id,
      userId: u1.id,
      role: TripRole.OWNER,
      status: TripMemberStatus.ACTIVE,
    }),
    tripMemberRepo.create({
      tripId: t1.id,
      userId: u2.id,
      role: TripRole.COLLABORATOR,
      status: TripMemberStatus.ACTIVE,
    }),
    tripMemberRepo.create({
      tripId: t1.id,
      userId: u3.id,
      role: TripRole.COLLABORATOR,
      status: TripMemberStatus.ACTIVE,
    }),
    tripMemberRepo.create({
      tripId: t1.id,
      userId: u4.id,
      role: TripRole.VIEWER,
      status: TripMemberStatus.INVITED,
    }),
    tripMemberRepo.create({
      tripId: t2.id,
      userId: u1.id,
      role: TripRole.OWNER,
      status: TripMemberStatus.ACTIVE,
    }),
    tripMemberRepo.create({
      tripId: t2.id,
      userId: u2.id,
      role: TripRole.COLLABORATOR,
      status: TripMemberStatus.ACTIVE,
    }),
  ]);
  console.log(`  Created 2 trips with members\n`);

  // ──────────────────────────────────────────────
  // 4. Bookings (Paris trip)
  // ──────────────────────────────────────────────
  console.log('✈️ Creating bookings...');
  const bookings = await bookingRepo.save([
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.FLIGHT,
      status: BookingStatus.CONFIRMED,
      providerName: 'Air France',
      confirmationCode: 'AF-29481',
      startsAt: new Date('2026-04-10T08:30:00Z'),
      endsAt: new Date('2026-04-10T11:45:00Z'),
      totalCost: 45000, // $450
      notes: 'Direct flight JFK → CDG. Window seats booked.',
      createdByUserId: u1.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.FLIGHT,
      status: BookingStatus.CONFIRMED,
      providerName: 'Air France',
      confirmationCode: 'AF-83127',
      startsAt: new Date('2026-04-17T14:00:00Z'),
      endsAt: new Date('2026-04-17T17:30:00Z'),
      totalCost: 42000, // $420
      notes: 'Return flight CDG → JFK.',
      createdByUserId: u1.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.HOTEL,
      status: BookingStatus.CONFIRMED,
      providerName: 'Hôtel Le Marais',
      confirmationCode: 'HLM-2026-7742',
      startsAt: new Date('2026-04-10T15:00:00Z'),
      endsAt: new Date('2026-04-17T11:00:00Z'),
      totalCost: 168000, // $1,680
      notes: '2 rooms, breakfast included. Near Bastille metro.',
      createdByUserId: u2.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.RESTAURANT,
      status: BookingStatus.CONFIRMED,
      providerName: 'Le Comptoir du Panthéon',
      confirmationCode: 'LCP-8891',
      startsAt: new Date('2026-04-12T19:30:00Z'),
      endsAt: new Date('2026-04-12T22:00:00Z'),
      totalCost: 18000, // $180
      notes: 'Dinner reservation for 4. Pre-fixe menu.',
      createdByUserId: u3.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.ACTIVITY,
      status: BookingStatus.PENDING,
      providerName: 'Musée du Louvre',
      confirmationCode: 'LOUVRE-T-55012',
      startsAt: new Date('2026-04-11T09:00:00Z'),
      endsAt: new Date('2026-04-11T13:00:00Z'),
      totalCost: 6800, // $68
      notes: 'Skip-the-line tickets × 4.',
      createdByUserId: u2.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.TRAIN,
      status: BookingStatus.CONFIRMED,
      providerName: 'Eurostar',
      confirmationCode: 'ES-443201',
      startsAt: new Date('2026-04-14T07:15:00Z'),
      endsAt: new Date('2026-04-14T09:45:00Z'),
      totalCost: 31000, // $310
      notes: 'Day trip to London. Standard Premier × 4.',
      createdByUserId: u1.id,
    }),
    bookingRepo.create({
      tripId: t1.id,
      type: BookingType.CAR,
      status: BookingStatus.PENDING,
      providerName: 'Hertz Paris CDG',
      totalCost: 22000, // $220
      notes: 'Optional: compact car for Versailles day trip.',
      createdByUserId: u3.id,
    }),
  ]);
  console.log(`  Created ${bookings.length} bookings\n`);

  // ──────────────────────────────────────────────
  // 5. Itinerary Days & Items
  // ──────────────────────────────────────────────
  console.log('🗺️ Creating itinerary...');
  const days = await dayRepo.save([
    dayRepo.create({ tripId: t1.id, date: '2026-04-10', dayIndex: 0 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-11', dayIndex: 1 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-12', dayIndex: 2 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-13', dayIndex: 3 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-14', dayIndex: 4 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-15', dayIndex: 5 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-16', dayIndex: 6 }),
    dayRepo.create({ tripId: t1.id, date: '2026-04-17', dayIndex: 7 }),
  ]);

  const items = await itemRepo.save([
    // Day 0 — Arrival
    itemRepo.create({
      tripId: t1.id,
      dayId: days[0].id,
      type: ItineraryItemType.FLIGHT,
      status: ItineraryItemStatus.BOOKED,
      title: 'Flight JFK → CDG',
      startsAt: new Date('2026-04-10T08:30:00Z'),
      endsAt: new Date('2026-04-10T11:45:00Z'),
      locationName: 'Charles de Gaulle Airport',
      address: 'CDG, Paris, France',
      bookingId: bookings[0].id,
      createdByUserId: u1.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[0].id,
      type: ItineraryItemType.HOTEL,
      status: ItineraryItemStatus.BOOKED,
      title: 'Check-in Hôtel Le Marais',
      startsAt: new Date('2026-04-10T15:00:00Z'),
      locationName: 'Hôtel Le Marais',
      address: '12 Rue du Temple, 75004 Paris',
      lat: 48.8588,
      lng: 2.3549,
      bookingId: bookings[2].id,
      createdByUserId: u2.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[0].id,
      type: ItineraryItemType.RESTAURANT,
      status: ItineraryItemStatus.PLANNED,
      title: 'Welcome dinner at Le Petit Cler',
      startsAt: new Date('2026-04-10T19:00:00Z'),
      endsAt: new Date('2026-04-10T21:00:00Z'),
      locationName: 'Le Petit Cler',
      address: '29 Rue Cler, 75007 Paris',
      estimatedCost: 12000,
      createdByUserId: u3.id,
    }),
    // Day 1 — Louvre & Culture
    itemRepo.create({
      tripId: t1.id,
      dayId: days[1].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.BOOKED,
      title: 'Louvre Museum visit',
      startsAt: new Date('2026-04-11T09:00:00Z'),
      endsAt: new Date('2026-04-11T13:00:00Z'),
      locationName: 'Musée du Louvre',
      address: 'Rue de Rivoli, 75001 Paris',
      lat: 48.8606,
      lng: 2.3376,
      estimatedCost: 6800,
      bookingId: bookings[4].id,
      createdByUserId: u2.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[1].id,
      type: ItineraryItemType.RESTAURANT,
      status: ItineraryItemStatus.PLANNED,
      title: 'Lunch at Café Marly',
      startsAt: new Date('2026-04-11T13:30:00Z'),
      endsAt: new Date('2026-04-11T14:30:00Z'),
      locationName: 'Café Marly',
      address: '93 Rue de Rivoli, 75001 Paris',
      estimatedCost: 9000,
      createdByUserId: u3.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[1].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.PLANNED,
      title: 'Seine River Cruise',
      startsAt: new Date('2026-04-11T16:00:00Z'),
      endsAt: new Date('2026-04-11T17:30:00Z'),
      locationName: 'Bateaux Mouches',
      address: "Pont de l'Alma, 75008 Paris",
      estimatedCost: 7200,
      createdByUserId: u1.id,
    }),
    // Day 2 — Montmartre & Dinner
    itemRepo.create({
      tripId: t1.id,
      dayId: days[2].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.PLANNED,
      title: 'Montmartre walking tour',
      startsAt: new Date('2026-04-12T10:00:00Z'),
      endsAt: new Date('2026-04-12T12:30:00Z'),
      locationName: 'Sacré-Cœur Basilica',
      address: '35 Rue du Chevalier de la Barre, 75018 Paris',
      lat: 48.8867,
      lng: 2.3431,
      estimatedCost: 4500,
      createdByUserId: u2.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[2].id,
      type: ItineraryItemType.RESTAURANT,
      status: ItineraryItemStatus.BOOKED,
      title: 'Dinner at Le Comptoir du Panthéon',
      startsAt: new Date('2026-04-12T19:30:00Z'),
      endsAt: new Date('2026-04-12T22:00:00Z'),
      locationName: 'Le Comptoir du Panthéon',
      address: '5 Rue Soufflot, 75005 Paris',
      estimatedCost: 18000,
      bookingId: bookings[3].id,
      createdByUserId: u3.id,
    }),
    // Day 3 — Versailles
    itemRepo.create({
      tripId: t1.id,
      dayId: days[3].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.PLANNED,
      title: 'Palace of Versailles day trip',
      startsAt: new Date('2026-04-13T08:30:00Z'),
      endsAt: new Date('2026-04-13T17:00:00Z'),
      locationName: 'Château de Versailles',
      address: "Place d'Armes, 78000 Versailles",
      lat: 48.8049,
      lng: 2.1204,
      estimatedCost: 8000,
      createdByUserId: u1.id,
    }),
    // Day 4 — London day trip
    itemRepo.create({
      tripId: t1.id,
      dayId: days[4].id,
      type: ItineraryItemType.TRANSPORT,
      status: ItineraryItemStatus.BOOKED,
      title: 'Eurostar to London',
      startsAt: new Date('2026-04-14T07:15:00Z'),
      endsAt: new Date('2026-04-14T09:45:00Z'),
      locationName: 'Gare du Nord',
      address: '18 Rue de Dunkerque, 75010 Paris',
      bookingId: bookings[5].id,
      createdByUserId: u1.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[4].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.PLANNED,
      title: 'London sightseeing',
      startsAt: new Date('2026-04-14T10:00:00Z'),
      endsAt: new Date('2026-04-14T18:00:00Z'),
      locationName: 'Central London',
      createdByUserId: u2.id,
    }),
    // Day 5 — Eiffel Tower & Left Bank
    itemRepo.create({
      tripId: t1.id,
      dayId: days[5].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.IDEA,
      title: 'Eiffel Tower visit',
      startsAt: new Date('2026-04-15T10:00:00Z'),
      endsAt: new Date('2026-04-15T12:00:00Z'),
      locationName: 'Eiffel Tower',
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
      lat: 48.8584,
      lng: 2.2945,
      estimatedCost: 5200,
      createdByUserId: u3.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[5].id,
      type: ItineraryItemType.NOTE,
      status: ItineraryItemStatus.IDEA,
      title: 'Free afternoon — shopping or rest?',
      createdByUserId: u1.id,
    }),
    // Day 6 — Last full day
    itemRepo.create({
      tripId: t1.id,
      dayId: days[6].id,
      type: ItineraryItemType.ACTIVITY,
      status: ItineraryItemStatus.PLANNED,
      title: "Musée d'Orsay",
      startsAt: new Date('2026-04-16T09:30:00Z'),
      endsAt: new Date('2026-04-16T12:30:00Z'),
      locationName: "Musée d'Orsay",
      address: "1 Rue de la Légion d'Honneur, 75007 Paris",
      estimatedCost: 6400,
      createdByUserId: u2.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[6].id,
      type: ItineraryItemType.RESTAURANT,
      status: ItineraryItemStatus.IDEA,
      title: 'Farewell dinner — TBD',
      startsAt: new Date('2026-04-16T20:00:00Z'),
      estimatedCost: 20000,
      createdByUserId: u1.id,
    }),
    // Day 7 — Departure
    itemRepo.create({
      tripId: t1.id,
      dayId: days[7].id,
      type: ItineraryItemType.HOTEL,
      status: ItineraryItemStatus.BOOKED,
      title: 'Hotel checkout',
      startsAt: new Date('2026-04-17T11:00:00Z'),
      locationName: 'Hôtel Le Marais',
      createdByUserId: u2.id,
    }),
    itemRepo.create({
      tripId: t1.id,
      dayId: days[7].id,
      type: ItineraryItemType.FLIGHT,
      status: ItineraryItemStatus.BOOKED,
      title: 'Flight CDG → JFK',
      startsAt: new Date('2026-04-17T14:00:00Z'),
      endsAt: new Date('2026-04-17T17:30:00Z'),
      locationName: 'Charles de Gaulle Airport',
      bookingId: bookings[1].id,
      createdByUserId: u1.id,
    }),
  ]);
  console.log(`  Created ${days.length} days, ${items.length} items\n`);

  // ──────────────────────────────────────────────
  // 6. Collaboration — Proposals, Options & Votes
  // ──────────────────────────────────────────────
  console.log('💬 Creating proposals & votes...');
  const proposal1 = await proposalRepo.save(
    proposalRepo.create({
      tripId: t1.id,
      title: 'Which restaurant for farewell dinner?',
      description:
        'We need to pick a restaurant for our last night in Paris. Budget around €50/person.',
      status: ProposalStatus.OPEN,
      createdByUserId: u1.id,
    }),
  );

  const opts1 = await optionRepo.save([
    optionRepo.create({
      proposalId: proposal1.id,
      label: 'Le Jules Verne (Eiffel Tower)',
      details: 'Fine dining with Eiffel Tower views. Pricey but unforgettable.',
      estimatedCost: 25000,
      createdByUserId: u1.id,
    }),
    optionRepo.create({
      proposalId: proposal1.id,
      label: 'Bouillon Chartier',
      details: 'Classic Parisian brasserie experience. Very affordable.',
      estimatedCost: 8000,
      createdByUserId: u3.id,
    }),
    optionRepo.create({
      proposalId: proposal1.id,
      label: 'Pink Mamma',
      details: 'Trendy Italian in the Marais. Great vibes, moderate price.',
      estimatedCost: 14000,
      createdByUserId: u2.id,
    }),
  ]);

  await voteRepo.save([
    voteRepo.create({ optionId: opts1[0].id, userId: u1.id }),
    voteRepo.create({ optionId: opts1[0].id, userId: u3.id }),
    voteRepo.create({ optionId: opts1[2].id, userId: u2.id }),
  ]);

  const proposal2 = await proposalRepo.save(
    proposalRepo.create({
      tripId: t1.id,
      title: 'Versailles or Giverny on Day 4?',
      description:
        "Should we take the train to Versailles or go to Monet's garden in Giverny?",
      status: ProposalStatus.CLOSED,
      createdByUserId: u2.id,
    }),
  );

  const opts2 = await optionRepo.save([
    optionRepo.create({
      proposalId: proposal2.id,
      label: 'Versailles',
      details: 'Grand palace and gardens. More walking but iconic.',
      createdByUserId: u2.id,
    }),
    optionRepo.create({
      proposalId: proposal2.id,
      label: "Giverny (Monet's Garden)",
      details: 'Quieter, more relaxed. Beautiful in spring.',
      createdByUserId: u3.id,
    }),
  ]);

  await voteRepo.save([
    voteRepo.create({ optionId: opts2[0].id, userId: u1.id }),
    voteRepo.create({ optionId: opts2[0].id, userId: u2.id }),
    voteRepo.create({ optionId: opts2[0].id, userId: u4.id }),
    voteRepo.create({ optionId: opts2[1].id, userId: u3.id }),
  ]);

  // Comments
  await commentRepo.save([
    commentRepo.create({
      tripId: t1.id,
      body: 'I think we should prioritize the Louvre on Day 1 since it gets crowded later in the week.',
      createdByUserId: u2.id,
    }),
    commentRepo.create({
      tripId: t1.id,
      itineraryItemId: items[3].id, // Louvre visit
      body: "Don't forget to download the Louvre app for the self-guided tour!",
      createdByUserId: u3.id,
    }),
    commentRepo.create({
      tripId: t1.id,
      body: 'Has anyone checked the Seine cruise schedule? Some are cancelled in April.',
      createdByUserId: u1.id,
    }),
    commentRepo.create({
      tripId: t1.id,
      body: "Good call — I'll verify and update the itinerary.",
      createdByUserId: u2.id,
    }),
  ]);
  console.log(
    `  Created 2 proposals, ${opts1.length + opts2.length} options, votes & comments\n`,
  );

  // ──────────────────────────────────────────────
  // 7. Tasks
  // ──────────────────────────────────────────────
  console.log('✅ Creating tasks...');
  const tasks = await taskRepo.save([
    taskRepo.create({
      tripId: t1.id,
      title: 'Book skip-the-line Eiffel Tower tickets',
      description:
        'Check availability for April 15. Need 4 tickets for the summit.',
      status: TaskStatus.PENDING,
      dueDate: '2026-03-25',
      assigneeUserId: u3.id,
      createdByUserId: u1.id,
    }),
    taskRepo.create({
      tripId: t1.id,
      title: 'Confirm hotel breakfast plan',
      description: 'Email Hôtel Le Marais to confirm breakfast is daily.',
      status: TaskStatus.COMPLETED,
      dueDate: '2026-03-20',
      assigneeUserId: u2.id,
      createdByUserId: u1.id,
    }),
    taskRepo.create({
      tripId: t1.id,
      title: 'Purchase travel insurance',
      description: 'Compare World Nomads vs Allianz for 7-day Europe coverage.',
      status: TaskStatus.IN_PROGRESS,
      dueDate: '2026-03-28',
      assigneeUserId: u1.id,
      createdByUserId: u1.id,
    }),
    taskRepo.create({
      tripId: t1.id,
      title: 'Print boarding passes',
      status: TaskStatus.PENDING,
      dueDate: '2026-04-08',
      assigneeUserId: u1.id,
      createdByUserId: u2.id,
    }),
    taskRepo.create({
      tripId: t1.id,
      title: 'Research metro day-pass options',
      description: 'Navigo Easy vs carnet of 10. Which is better for tourists?',
      status: TaskStatus.COMPLETED,
      dueDate: '2026-03-15',
      assigneeUserId: u2.id,
      createdByUserId: u3.id,
    }),
    taskRepo.create({
      tripId: t1.id,
      title: 'Share packing checklist',
      description:
        'Create a shared doc with suggested items for spring Paris weather.',
      status: TaskStatus.PENDING,
      dueDate: '2026-04-01',
      assigneeUserId: u3.id,
      createdByUserId: u1.id,
    }),
  ]);
  console.log(`  Created ${tasks.length} tasks\n`);

  // ──────────────────────────────────────────────
  // 8. Documents (metadata only — no S3 uploads)
  // ──────────────────────────────────────────────
  console.log('📁 Creating document records...');
  const docs = await docRepo.save([
    docRepo.create({
      tripId: t1.id,
      name: 'Air France Booking Confirmation',
      category: DocumentCategory.BOOKINGS,
      fileType: 'PDF',
      storageKey: `trips/${t1.id}/docs/air-france-confirmation.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 245_000,
      uploadedByUserId: u1.id,
    }),
    docRepo.create({
      tripId: t1.id,
      name: 'Hotel Le Marais Voucher',
      category: DocumentCategory.BOOKINGS,
      fileType: 'PDF',
      storageKey: `trips/${t1.id}/docs/hotel-voucher.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 180_000,
      uploadedByUserId: u2.id,
    }),
    docRepo.create({
      tripId: t1.id,
      name: 'Travel Insurance Policy',
      category: DocumentCategory.INSURANCE,
      fileType: 'PDF',
      storageKey: `trips/${t1.id}/docs/insurance-policy.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 520_000,
      uploadedByUserId: u1.id,
    }),
    docRepo.create({
      tripId: t1.id,
      name: 'Sarah Passport Scan',
      category: DocumentCategory.IDS,
      fileType: 'Image',
      storageKey: `trips/${t1.id}/docs/sarah-passport.jpg`,
      mimeType: 'image/jpeg',
      sizeBytes: 1_200_000,
      uploadedByUserId: u1.id,
    }),
    docRepo.create({
      tripId: t1.id,
      name: 'Paris Itinerary Draft v2',
      category: DocumentCategory.ITINERARIES,
      fileType: 'Word Document',
      storageKey: `trips/${t1.id}/docs/itinerary-draft-v2.docx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 98_000,
      uploadedByUserId: u3.id,
    }),
    docRepo.create({
      tripId: t1.id,
      name: 'Eurostar E-Ticket',
      category: DocumentCategory.BOOKINGS,
      fileType: 'PDF',
      storageKey: `trips/${t1.id}/docs/eurostar-ticket.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 310_000,
      uploadedByUserId: u1.id,
    }),
  ]);
  console.log(`  Created ${docs.length} documents\n`);

  // ──────────────────────────────────────────────
  // 9. Rules
  // ──────────────────────────────────────────────
  console.log('📐 Creating rules...');
  const ruleSet = await ruleSetRepo.save(
    ruleSetRepo.create({
      tripId: t1.id,
      name: 'Paris Trip Rules',
      isActive: true,
    }),
  );

  await ruleRepo.save([
    ruleRepo.create({
      ruleSetId: ruleSet.id,
      type: RuleType.NO_REDEYE,
      enabled: true,
      note: 'No flights between 11pm and 6am.',
    }),
    ruleRepo.create({
      ruleSetId: ruleSet.id,
      type: RuleType.MAX_LAYOVERS,
      enabled: true,
      params: { max: 1 },
      note: 'Maximum 1 layover per flight segment.',
    }),
    ruleRepo.create({
      ruleSetId: ruleSet.id,
      type: RuleType.BUDGET_MAX_PER_PERSON,
      enabled: true,
      params: { maxCents: 125000 },
      note: 'Cap at $1,250 per person for the trip.',
    }),
    ruleRepo.create({
      ruleSetId: ruleSet.id,
      type: RuleType.DAILY_WALKING_CAP_KM,
      enabled: false,
      params: { maxKm: 15 },
      note: 'Soft limit — disabled for now.',
    }),
  ]);
  console.log(`  Created rule set with 4 rules\n`);

  // ──────────────────────────────────────────────
  // 10. Notifications
  // ──────────────────────────────────────────────
  console.log('🔔 Creating notifications...');
  await notifRepo.save([
    notifRepo.create({
      recipientUserId: u1.id,
      type: NotificationType.BOOKING_UPDATED,
      channel: NotificationChannel.IN_APP,
      title: 'Air France confirmation received',
      body: 'Your outbound flight AF-29481 is confirmed for April 10.',
      tripId: t1.id,
      actorUserId: u2.id,
      read: true,
      readAt: new Date('2026-03-15T10:00:00Z'),
    }),
    notifRepo.create({
      recipientUserId: u1.id,
      type: NotificationType.COMMENT,
      channel: NotificationChannel.IN_APP,
      title: 'Alex commented on Paris trip',
      body: 'I think we should prioritize the Louvre on Day 1…',
      tripId: t1.id,
      actorUserId: u2.id,
      read: false,
    }),
    notifRepo.create({
      recipientUserId: u1.id,
      type: NotificationType.VOTE,
      channel: NotificationChannel.IN_APP,
      title: 'Maria voted on "Farewell dinner"',
      body: 'Maria voted for Le Jules Verne.',
      tripId: t1.id,
      actorUserId: u3.id,
      read: false,
    }),
    notifRepo.create({
      recipientUserId: u2.id,
      type: NotificationType.PROPOSAL,
      channel: NotificationChannel.IN_APP,
      title: 'New proposal: Farewell dinner',
      body: 'Sarah created a new proposal for the farewell dinner restaurant.',
      tripId: t1.id,
      actorUserId: u1.id,
      read: false,
    }),
    notifRepo.create({
      recipientUserId: u3.id,
      type: NotificationType.ITINERARY_UPDATED,
      channel: NotificationChannel.IN_APP,
      title: 'Itinerary updated',
      body: 'Alex added "Seine River Cruise" to Day 1.',
      tripId: t1.id,
      actorUserId: u2.id,
      read: true,
      readAt: new Date('2026-03-16T14:30:00Z'),
    }),
    notifRepo.create({
      recipientUserId: u1.id,
      type: NotificationType.REMINDER,
      channel: NotificationChannel.IN_APP,
      title: 'Task due soon',
      body: 'Purchase travel insurance is due March 28.',
      tripId: t1.id,
      read: false,
    }),
  ]);
  console.log(`  Created 6 notifications\n`);

  // ──────────────────────────────────────────────
  // 11. Disruption & Rebooking (scenario)
  // ──────────────────────────────────────────────
  console.log('🔄 Creating disruption scenario...');
  const disruption = await disruptionRepo.save(
    disruptionRepo.create({
      tripId: t1.id,
      bookingId: bookings[5].id, // Eurostar
      type: DisruptionType.DELAY,
      message:
        'Eurostar service delayed by 2 hours due to signaling issues at Calais.',
      payload: {
        originalDeparture: '2026-04-14T07:15:00Z',
        newDeparture: '2026-04-14T09:15:00Z',
      },
      createdByUserId: u1.id,
    }),
  );

  const rebookingCase = await rebookingCaseRepo.save(
    rebookingCaseRepo.create({
      tripId: t1.id,
      bookingId: bookings[5].id,
      disruptionEventId: disruption.id,
      status: RebookingCaseStatus.OPTIONS_READY,
    }),
  );

  await rebookingOptionRepo.save([
    rebookingOptionRepo.create({
      rebookingCaseId: rebookingCase.id,
      label: 'Take the delayed 09:15 Eurostar',
      startsAt: new Date('2026-04-14T09:15:00Z'),
      endsAt: new Date('2026-04-14T11:45:00Z'),
      priceDelta: 0,
      score: 70,
      notes: {
        warnings: ['Arrive 2 hrs late — less London time'],
      },
    }),
    rebookingOptionRepo.create({
      rebookingCaseId: rebookingCase.id,
      label: 'Switch to 12:00 Eurostar (Standard)',
      startsAt: new Date('2026-04-14T12:00:00Z'),
      endsAt: new Date('2026-04-14T14:30:00Z'),
      priceDelta: -5000,
      score: 50,
      notes: {
        warnings: ['Only half-day in London'],
      },
    }),
    rebookingOptionRepo.create({
      rebookingCaseId: rebookingCase.id,
      label: 'Cancel London — stay in Paris',
      priceDelta: -31000,
      score: 40,
      notes: {
        warnings: ['Lose London day trip'],
        blocks: ['Requires Eurostar refund process'],
      },
    }),
  ]);
  console.log(`  Created 1 disruption, 1 rebooking case, 3 options\n`);

  // ──────────────────────────────────────────────
  // 12. Audit logs (sample)
  // ──────────────────────────────────────────────
  console.log('📋 Creating audit log entries...');
  await auditRepo.save([
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u1.id,
      action: AuditAction.WORKSPACE_CREATED,
      targetType: 'Workspace',
      targetId: ws1.id,
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u1.id,
      action: AuditAction.TRIP_CREATED,
      targetType: 'Trip',
      targetId: t1.id,
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u1.id,
      action: AuditAction.BOOKING_CREATED,
      targetType: 'Booking',
      targetId: bookings[0].id,
      meta: { type: 'FLIGHT', provider: 'Air France' },
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u2.id,
      action: AuditAction.ITINERARY_DAY_CREATED,
      targetType: 'ItineraryDay',
      targetId: days[0].id,
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u2.id,
      action: AuditAction.ITINERARY_ITEM_CREATED,
      targetType: 'ItineraryItem',
      targetId: items[3].id,
      meta: { title: 'Louvre Museum visit' },
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u1.id,
      action: AuditAction.PROPOSAL_CREATED,
      targetType: 'Proposal',
      targetId: proposal1.id,
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u3.id,
      action: AuditAction.TASK_CREATED,
      targetType: 'Task',
      targetId: tasks[0].id,
      meta: { title: 'Book skip-the-line Eiffel Tower tickets' },
    }),
    auditRepo.create({
      tripId: t1.id,
      workspaceId: ws1.id,
      actorUserId: u1.id,
      action: AuditAction.DOCUMENT_UPLOADED,
      targetType: 'Document',
      targetId: docs[0].id,
      meta: { name: 'Air France Booking Confirmation' },
    }),
  ]);
  console.log(`  Created 8 audit entries\n`);

  // Done!
  console.log('═══════════════════════════════════════');
  console.log('🎉 Seed complete!');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Login credentials (all users):');
  console.log('  Password: Password1!');
  console.log('');
  console.log('Users:');
  console.log(`  sarah@tripops.dev  (${u1.id})`);
  console.log(`  alex@tripops.dev   (${u2.id})`);
  console.log(`  maria@tripops.dev  (${u3.id})`);
  console.log(`  james@tripops.dev  (${u4.id})`);
  console.log('');
  console.log('Workspaces:');
  console.log(`  Paris Getaway   (${ws1.id})`);
  console.log(`  Tokyo Adventure (${ws2.id})`);
  console.log('');
  console.log('Trips:');
  console.log(`  Paris Spring Break  (${t1.id})`);
  console.log(`  Tokyo Team Retreat  (${t2.id})`);
  console.log('');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
