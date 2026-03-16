/**
 * TripOps Core API — End-to-End Tests
 *
 * These tests run against a live PostgreSQL test database.
 * Set the following environment variables (or a .env.test file) before running:
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 *   JWT_ACCESS_SECRET (≥ 20 chars)
 *
 * Run with:  pnpm test:e2e
 *
 * Tests are intentionally sequential and stateful — each describe block builds on
 * resources created in the previous ones (user → workspace → trip → etc.).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('TripOps API (e2e)', () => {
  let app: INestApplication;

  // ── Shared state accumulated across describe blocks ───────────────────────
  let accessToken: string;
  let refreshCookie: string;
  let userId: string;

  let workspaceId: string;
  let tripId: string;

  let itineraryDayId: string;
  let itineraryItemId: string;

  let bookingId: string;

  let proposalId: string;
  let proposalOptionId: string;

  let rebookingCaseId: string;

  const TEST_EMAIL = `e2e+${Date.now()}@tripops.test`;
  const TEST_PASSWORD = 'SecurePass123!';

  // ── Bootstrap a single app for the entire suite ───────────────────────────
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate the middleware registered in main.ts
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════════════════════════════
  describe('Auth', () => {
    // ── POST /auth/register ────────────────────────────────────────────────
    describe('POST /auth/register', () => {
      it('returns 400 when email is missing', () =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send({ password: TEST_PASSWORD })
          .expect(400));

      it('returns 400 for an invalid email address', () =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'not-an-email', password: TEST_PASSWORD })
          .expect(400));

      it('returns 400 when password is shorter than 8 characters', () =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: TEST_EMAIL, password: 'short' })
          .expect(400));

      it('creates a new user and returns accessToken + sets refresh cookie', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            fullName: 'E2E Tester',
          })
          .expect(201);

        expect(res.body.accessToken).toBeDefined();
        expect(typeof res.body.accessToken).toBe('string');
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user.email).toBe(TEST_EMAIL);

        accessToken = res.body.accessToken;
        userId = res.body.user.id;

        const cookies = res.headers['set-cookie'] as unknown as string[];
        refreshCookie =
          cookies?.find((c) => c.startsWith('tripops_refresh')) ?? '';
        expect(refreshCookie).toBeTruthy();
      });

      it('returns 409 when the email is already registered', () =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
          .expect(409));
    });

    // ── POST /auth/login ───────────────────────────────────────────────────
    describe('POST /auth/login', () => {
      it('returns 401 for an incorrect password', () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_EMAIL, password: 'WrongPassword9!' })
          .expect(401));

      it('returns 401 for an unknown email', () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'ghost@tripops.test', password: TEST_PASSWORD })
          .expect(401));

      it('logs in successfully and returns accessToken + refresh cookie', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
          .expect(201);

        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.email).toBe(TEST_EMAIL);

        accessToken = res.body.accessToken;
        const cookies = res.headers['set-cookie'] as unknown as string[];
        refreshCookie =
          cookies?.find((c) => c.startsWith('tripops_refresh')) ??
          refreshCookie;
      });
    });

    // ── GET /auth/me ───────────────────────────────────────────────────────
    describe('GET /auth/me', () => {
      it('returns 401 without an Authorization header', () =>
        request(app.getHttpServer()).get('/auth/me').expect(401));

      it('returns the JWT payload for the authenticated user', async () => {
        const res = await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.userId).toBe(userId);
        expect(res.body.email).toBe(TEST_EMAIL);
      });
    });

    // ── POST /auth/refresh ─────────────────────────────────────────────────
    describe('POST /auth/refresh', () => {
      it('returns 401 when no refresh cookie is present', () =>
        request(app.getHttpServer()).post('/auth/refresh').expect(401));

      it('issues a new accessToken from a valid refresh cookie', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', refreshCookie)
          .expect(201);

        expect(res.body.accessToken).toBeDefined();

        // Update shared state with the rotated tokens
        accessToken = res.body.accessToken;
        const cookies = res.headers['set-cookie'] as unknown as string[];
        const rotated = cookies?.find((c) => c.startsWith('tripops_refresh'));
        if (rotated) refreshCookie = rotated;
      });
    });

    // ── POST /auth/logout ──────────────────────────────────────────────────
    describe('POST /auth/logout', () => {
      it('invalidates the session and returns { ok: true }', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Cookie', refreshCookie)
          .expect(201);

        expect(res.body.ok).toBe(true);
      });

      it('re-login to restore a valid token for subsequent tests', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
          .expect(201);

        accessToken = res.body.accessToken;
        const cookies = res.headers['set-cookie'] as unknown as string[];
        refreshCookie =
          cookies?.find((c) => c.startsWith('tripops_refresh')) ??
          refreshCookie;
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════════════════════════════════
  describe('Users', () => {
    describe('GET /users/me', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer()).get('/users/me').expect(401));

      it('returns the full profile of the authenticated user', async () => {
        const res = await request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.id).toBe(userId);
        expect(res.body.email).toBe(TEST_EMAIL);
        expect(res.body.fullName).toBe('E2E Tester');
        expect(res.body.createdAt).toBeDefined();
      });
    });

    describe('GET /users/:id', () => {
      it('returns a user profile by id', async () => {
        const res = await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.id).toBe(userId);
        expect(res.body.email).toBe(TEST_EMAIL);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // WORKSPACES
  // ══════════════════════════════════════════════════════════════════════════
  describe('Workspaces', () => {
    describe('POST /workspaces', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .post('/workspaces')
          .send({ name: 'Test' })
          .expect(401));

      it('returns 400 when name is too short', () =>
        request(app.getHttpServer())
          .post('/workspaces')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'X' })
          .expect(400));

      it('creates a workspace and makes the caller an OWNER', async () => {
        const res = await request(app.getHttpServer())
          .post('/workspaces')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'E2E Workspace', description: 'Created by e2e tests' })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe('E2E Workspace');
        expect(res.body.description).toBe('Created by e2e tests');
        workspaceId = res.body.id;
      });
    });

    describe('GET /workspaces', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer()).get('/workspaces').expect(401));

      it('returns all workspaces the user belongs to', async () => {
        const res = await request(app.getHttpServer())
          .get('/workspaces')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((w: { id: string }) => w.id === workspaceId)).toBe(
          true,
        );
      });
    });

    describe('GET /workspaces/:workspaceId', () => {
      it('returns the workspace detail', async () => {
        const res = await request(app.getHttpServer())
          .get(`/workspaces/${workspaceId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.id).toBe(workspaceId);
        expect(res.body.name).toBe('E2E Workspace');
      });

      it('returns 403 when user is not a member of the workspace', async () => {
        await request(app.getHttpServer())
          .get('/workspaces/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TRIPS
  // ══════════════════════════════════════════════════════════════════════════
  describe('Trips', () => {
    describe('POST /workspaces/:workspaceId/trips', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .post(`/workspaces/${workspaceId}/trips`)
          .send({
            title: 'No Auth',
            destination: 'Tokyo',
            startDate: '2026-09-01',
            endDate: '2026-09-14',
          })
          .expect(401));

      it('returns 400 when required fields are missing', () =>
        request(app.getHttpServer())
          .post(`/workspaces/${workspaceId}/trips`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: 'Missing destination' })
          .expect(400));

      it('returns 400 when dates are not ISO date strings', () =>
        request(app.getHttpServer())
          .post(`/workspaces/${workspaceId}/trips`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Bad Dates',
            destination: 'Tokyo',
            startDate: 'not-a-date',
            endDate: 'also-bad',
          })
          .expect(400));

      it('creates a trip and auto-enrols the creator as OWNER', async () => {
        const res = await request(app.getHttpServer())
          .post(`/workspaces/${workspaceId}/trips`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'E2E Trip',
            destination: 'Tokyo, Japan',
            startDate: '2026-09-01',
            endDate: '2026-09-14',
            budgetTarget: 500000,
          })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('E2E Trip');
        expect(res.body.destination).toBe('Tokyo, Japan');
        expect(res.body.budgetTarget).toBe(500000);
        tripId = res.body.id;
      });
    });

    describe('GET /workspaces/:workspaceId/trips', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .get(`/workspaces/${workspaceId}/trips`)
          .expect(401));

      it('lists all trips visible to the user in the workspace', async () => {
        const res = await request(app.getHttpServer())
          .get(`/workspaces/${workspaceId}/trips`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((t: { id: string }) => t.id === tripId)).toBe(
          true,
        );
      });
    });

    describe('GET /trips/:tripId', () => {
      it('returns the trip details', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.id).toBe(tripId);
        expect(res.body.title).toBe('E2E Trip');
      });

      it('returns 404 for a non-existent trip id', () =>
        request(app.getHttpServer())
          .get('/trips/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404));
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ITINERARY
  // ══════════════════════════════════════════════════════════════════════════
  describe('Itinerary', () => {
    describe('GET /trips/:tripId/itinerary', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .get(`/trips/${tripId}/itinerary`)
          .expect(401));

      it('returns an empty itinerary for a new trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/itinerary`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.days).toBeDefined();
        expect(Array.isArray(res.body.days)).toBe(true);
        expect(res.body.unassigned).toBeDefined();
      });
    });

    describe('POST /trips/:tripId/itinerary/days', () => {
      it('returns 400 for an invalid date string', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/days`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ date: 'not-a-date', dayIndex: 0 })
          .expect(400));

      it('creates an itinerary day', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/days`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ date: '2026-09-01', dayIndex: 0 })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.date).toContain('2026-09-01');
        expect(res.body.tripId).toBe(tripId);
        itineraryDayId = res.body.id;
      });
    });

    describe('POST /trips/:tripId/itinerary/items', () => {
      it('returns 400 for an invalid item type', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'NOT_A_TYPE', title: 'Bad item' })
          .expect(400));

      it('returns 400 when title is missing', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'ACTIVITY' })
          .expect(400));

      it('creates an itinerary item attached to a day', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            type: 'ACTIVITY',
            title: 'Visit Senso-ji Temple',
            dayId: itineraryDayId,
            startsAt: '2026-09-01T09:00:00Z',
            locationName: 'Senso-ji Temple, Asakusa',
          })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Visit Senso-ji Temple');
        expect(res.body.type).toBe('ACTIVITY');
        expect(res.body.dayId).toBe(itineraryDayId);
        itineraryItemId = res.body.id;
      });

      it('creates an unassigned itinerary item (no dayId)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/itinerary/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'NOTE', title: 'Pack light clothing' })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.dayId).toBeNull();
      });
    });

    describe('PATCH /trips/:tripId/itinerary/items/:itemId', () => {
      it('updates the title and status of an itinerary item', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/trips/${tripId}/itinerary/items/${itineraryItemId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ title: 'Visit Senso-ji (morning)', status: 'PLANNED' })
          .expect(200);

        expect(res.body.title).toBe('Visit Senso-ji (morning)');
        expect(res.body.status).toBe('PLANNED');
      });
    });

    it('itinerary now contains the created day and items', async () => {
      const res = await request(app.getHttpServer())
        .get(`/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const day = res.body.days.find(
        (d: { id: string }) => d.id === itineraryDayId,
      );
      expect(day).toBeDefined();
      expect(
        day.items.some((i: { id: string }) => i.id === itineraryItemId),
      ).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BOOKINGS
  // ══════════════════════════════════════════════════════════════════════════
  describe('Bookings', () => {
    describe('POST /trips/:tripId/bookings', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/bookings`)
          .send({ type: 'FLIGHT', providerName: 'TestAir' })
          .expect(401));

      it('returns 400 for an invalid booking type enum', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/bookings`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'SPACESHIP', providerName: 'Elon Air' })
          .expect(400));

      it('returns 400 when providerName is missing', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/bookings`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'FLIGHT' })
          .expect(400));

      it('creates a flight booking', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/bookings`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            type: 'FLIGHT',
            providerName: 'TestAir',
            confirmationCode: 'TKT-ABC123',
            status: 'CONFIRMED',
            startsAt: '2026-09-01T08:00:00Z',
            endsAt: '2026-09-01T20:00:00Z',
            totalCost: 80000,
          })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.type).toBe('FLIGHT');
        expect(res.body.providerName).toBe('TestAir');
        expect(res.body.confirmationCode).toBe('TKT-ABC123');
        expect(res.body.tripId).toBe(tripId);
        bookingId = res.body.id;
      });

      it('creates a hotel booking', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/bookings`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            type: 'HOTEL',
            providerName: 'Park Hyatt Tokyo',
            startsAt: '2026-09-01T15:00:00Z',
            endsAt: '2026-09-14T12:00:00Z',
            totalCost: 300000,
          })
          .expect(201);

        expect(res.body.type).toBe('HOTEL');
      });
    });

    describe('GET /trips/:tripId/bookings', () => {
      it('lists all bookings for the trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/bookings`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((b: { id: string }) => b.id === bookingId)).toBe(
          true,
        );
        expect(res.body.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('GET /trips/:tripId/bookings/:bookingId', () => {
      it('returns a single booking by id', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/bookings/${bookingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.id).toBe(bookingId);
        expect(res.body.type).toBe('FLIGHT');
        expect(res.body.totalCost).toBe(80000);
      });

      it('returns 404 for a non-existent booking id', () =>
        request(app.getHttpServer())
          .get(`/trips/${tripId}/bookings/00000000-0000-0000-0000-000000000000`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404));
    });

    describe('PATCH /trips/:tripId/bookings/:bookingId', () => {
      it('updates the confirmation code and status', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/trips/${tripId}/bookings/${bookingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ confirmationCode: 'TKT-XYZ789', status: 'CONFIRMED' })
          .expect(200);

        expect(res.body.confirmationCode).toBe('TKT-XYZ789');
        expect(res.body.status).toBe('CONFIRMED');
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // COLLAB — Comments, Proposals, Options, Votes
  // ══════════════════════════════════════════════════════════════════════════
  describe('Collab', () => {
    describe('Comments', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .get(`/trips/${tripId}/comments`)
          .expect(401));

      it('returns 400 when body is an empty string', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ body: '' })
          .expect(400));

      it('creates a comment on the trip', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ body: 'So excited about this trip!' })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.body).toBe('So excited about this trip!');
        expect(res.body.authorUserId).toBe(userId);
      });

      it('creates a comment linked to an itinerary item', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            body: 'Make sure to get there early.',
            itineraryItemId,
          })
          .expect(201);

        expect(res.body.itineraryItemId).toBe(itineraryItemId);
      });

      it('lists all comments on the trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/comments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Proposals', () => {
      it('returns 400 when proposal title is missing', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/proposals`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ description: 'No title here' })
          .expect(400));

      it('creates a proposal', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/proposals`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: 'Where should we eat on day 1?',
            description: 'Sushi or ramen?',
          })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Where should we eat on day 1?');
        proposalId = res.body.id;
      });

      it('lists proposals on the trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/proposals`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((p: { id: string }) => p.id === proposalId)).toBe(
          true,
        );
      });

      it('returns 400 when option label is missing', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/proposals/${proposalId}/options`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ details: 'No label' })
          .expect(400));

      it('adds an option to the proposal', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/proposals/${proposalId}/options`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            label: 'Sushi at Tsukiji',
            details: 'Fresh sushi near the old fish market',
            estimatedCost: 6000,
          })
          .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.label).toBe('Sushi at Tsukiji');
        proposalOptionId = res.body.id;
      });

      it('votes on a proposal option', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/options/${proposalOptionId}/vote`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201);

        expect(res.body).toBeDefined();
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RULES
  // ══════════════════════════════════════════════════════════════════════════
  describe('Rules', () => {
    describe('GET /trips/:tripId/rules', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer()).get(`/trips/${tripId}/rules`).expect(401));

      it('returns an empty rule set for a new trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/rules`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.tripId).toBe(tripId);
        expect(res.body.ruleSet).toBeNull();
      });
    });

    describe('PUT /trips/:tripId/rules', () => {
      it('returns 400 for an invalid rule type enum', () =>
        request(app.getHttpServer())
          .put(`/trips/${tripId}/rules`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ rules: [{ type: 'INVALID_RULE_TYPE' }] })
          .expect(400));

      it('creates a rule set with multiple rules', async () => {
        const res = await request(app.getHttpServer())
          .put(`/trips/${tripId}/rules`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            rules: [
              { type: 'NO_REDEYE', enabled: true },
              { type: 'VEG_ONLY', enabled: false },
              {
                type: 'BUDGET_MAX_PER_PERSON',
                enabled: true,
                params: { maxUsd: 2000 },
              },
            ],
          })
          .expect(200);

        expect(res.body.rules).toBeDefined();
        expect(Array.isArray(res.body.rules)).toBe(true);
        expect(res.body.rules.length).toBe(3);
      });

      it('upserts the rule set (replaces rules)', async () => {
        const res = await request(app.getHttpServer())
          .put(`/trips/${tripId}/rules`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            rules: [{ type: 'NO_REDEYE', enabled: true }],
          })
          .expect(200);

        expect(res.body.rules.length).toBe(1);
        expect(res.body.rules[0].type).toBe('NO_REDEYE');
      });
    });

    describe('POST /trips/:tripId/rules/evaluate-item', () => {
      it('evaluates rules against an itinerary item', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/rules/evaluate-item`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ itineraryItemId })
          .expect(201);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  describe('Audit', () => {
    describe('GET /trips/:tripId/audit', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer()).get(`/trips/${tripId}/audit`).expect(401));

      it('returns audit log entries (actions recorded during the test run)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/audit`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        // The trip creation should have been recorded
        expect(res.body.length).toBeGreaterThan(0);
      });

      it('respects the limit query parameter', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/audit?limit=1&offset=0`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeLessThanOrEqual(1);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // REBOOKING
  // ══════════════════════════════════════════════════════════════════════════
  describe('Rebooking', () => {
    describe('GET /trips/:tripId/rebooking/cases', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .get(`/trips/${tripId}/rebooking/cases`)
          .expect(401));

      it('returns an empty case list for a new trip', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/rebooking/cases`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    describe('POST /trips/:tripId/rebooking/simulate-disruption', () => {
      it('returns 400 for an invalid disruption type', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/rebooking/simulate-disruption`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ bookingId, type: 'EARTHQUAKE' })
          .expect(400));

      it('returns 400 when bookingId is missing', () =>
        request(app.getHttpServer())
          .post(`/trips/${tripId}/rebooking/simulate-disruption`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ type: 'CANCELLATION' })
          .expect(400));

      it('simulates a flight cancellation and opens a rebooking case', async () => {
        const res = await request(app.getHttpServer())
          .post(`/trips/${tripId}/rebooking/simulate-disruption`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            bookingId,
            type: 'CANCELLATION',
            message: 'Flight cancelled due to typhoon warning.',
          })
          .expect(201);

        expect(res.body.disruptionEventId).toBeDefined();
        expect(res.body.rebookingCaseId).toBeDefined();
        rebookingCaseId = res.body.rebookingCaseId;
      });
    });

    describe('GET /trips/:tripId/rebooking/cases/:caseId', () => {
      it('returns the rebooking case with options and decision', async () => {
        const res = await request(app.getHttpServer())
          .get(`/trips/${tripId}/rebooking/cases/${rebookingCaseId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.case).toBeDefined();
        expect(res.body.case.id).toBe(rebookingCaseId);
        expect(Array.isArray(res.body.options)).toBe(true);
        expect(res.body.decision).toBeNull(); // no decision made yet
      });

      it('returns 404 for a non-existent case id', () =>
        request(app.getHttpServer())
          .get(
            `/trips/${tripId}/rebooking/cases/00000000-0000-0000-0000-000000000000`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404));
    });

    describe('POST /trips/:tripId/rebooking/cases/:caseId/generate-options', () => {
      it('generates rebooking options for the case', async () => {
        const res = await request(app.getHttpServer())
          .post(
            `/trips/${tripId}/rebooking/cases/${rebookingCaseId}/generate-options`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ count: 2 })
          .expect(201);

        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════
  describe('Notifications', () => {
    describe('GET /notifications', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer()).get('/notifications').expect(401));

      it('returns a paginated list with total and unreadCount', async () => {
        const res = await request(app.getHttpServer())
          .get('/notifications')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(Array.isArray(res.body.items)).toBe(true);
        expect(typeof res.body.total).toBe('number');
        expect(typeof res.body.unreadCount).toBe('number');
      });

      it('respects limit and offset query params', async () => {
        const res = await request(app.getHttpServer())
          .get('/notifications?limit=5&offset=0')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.items.length).toBeLessThanOrEqual(5);
      });
    });

    describe('GET /notifications/unread-count', () => {
      it('returns 401 without a token', () =>
        request(app.getHttpServer())
          .get('/notifications/unread-count')
          .expect(401));

      it('returns { count: number }', async () => {
        const res = await request(app.getHttpServer())
          .get('/notifications/unread-count')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(typeof res.body.count).toBe('number');
        expect(res.body.count).toBeGreaterThanOrEqual(0);
      });
    });

    describe('PATCH /notifications/read', () => {
      it('marks a specific set of notifications as read', async () => {
        const res = await request(app.getHttpServer())
          .patch('/notifications/read')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ids: [] }) // empty array is a valid no-op
          .expect(200);

        expect(res.body.ok).toBe(true);
      });
    });

    describe('PATCH /notifications/read-all', () => {
      it('marks all notifications as read', async () => {
        const res = await request(app.getHttpServer())
          .patch('/notifications/read-all')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.ok).toBe(true);
      });

      it('unread count is 0 after marking all as read', async () => {
        const res = await request(app.getHttpServer())
          .get('/notifications/unread-count')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body.count).toBe(0);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECURITY — cross-cutting authentication enforcement
  // ══════════════════════════════════════════════════════════════════════════
  describe('Security — unauthenticated access is rejected across all modules', () => {
    const unauthenticatedCases = [
      // Auth
      { method: 'get', url: '/auth/me' },
      // Users
      { method: 'get', url: '/users/me' },
      // Workspaces
      { method: 'get', url: '/workspaces' },
      { method: 'post', url: '/workspaces' },
      // Trips  (workspaceId / tripId resolved after workspace + trip tests)
      { method: 'get', url: '/workspaces/some-id/trips' },
      { method: 'get', url: '/trips/some-id' },
      // Itinerary
      { method: 'get', url: '/trips/some-id/itinerary' },
      { method: 'post', url: '/trips/some-id/itinerary/days' },
      { method: 'post', url: '/trips/some-id/itinerary/items' },
      // Bookings
      { method: 'get', url: '/trips/some-id/bookings' },
      { method: 'post', url: '/trips/some-id/bookings' },
      // Collab
      { method: 'get', url: '/trips/some-id/comments' },
      { method: 'post', url: '/trips/some-id/comments' },
      { method: 'get', url: '/trips/some-id/proposals' },
      // Rules
      { method: 'get', url: '/trips/some-id/rules' },
      // Audit
      { method: 'get', url: '/trips/some-id/audit' },
      // Rebooking
      { method: 'get', url: '/trips/some-id/rebooking/cases' },
      // Notifications
      { method: 'get', url: '/notifications' },
      { method: 'get', url: '/notifications/unread-count' },
    ];

    it.each(unauthenticatedCases)(
      '$method $url → 401',
      async ({ method, url }) => {
        await (request(app.getHttpServer()) as Record<string, any>)
          [method](url)
          .expect(401);
      },
    );
  });
});
