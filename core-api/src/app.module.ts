import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { envSchema } from './config/env.schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { TripsModule } from './trips/trips.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { CollabModule } from './collab/collab.module';
import { RulesModule } from './rules/rules.module';
import { BookingsModule } from './bookings/bookings.module';
import { RebookingModule } from './rebooking/rebooking.module';
import { AuditModule } from './audit/audit.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JobsModule } from './jobs/jobs.module';
import { TasksModule } from './tasks/tasks.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const parsed = envSchema.safeParse(env);
        if (!parsed.success) throw new Error(parsed.error.message);
        return parsed.data;
      },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    EventsModule,
    AuthModule,
    UsersModule,
    WorkspaceModule,
    TripsModule,
    ItineraryModule,
    CollabModule,
    RulesModule,
    BookingsModule,
    RebookingModule,
    AuditModule,
    NotificationsModule,
    JobsModule,
    TasksModule,
    DocumentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
