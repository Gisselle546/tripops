import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OutboxEvent } from './entities/outbox-event.entity';
import { EventsService } from './events.service';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    TypeOrmModule.forFeature([OutboxEvent]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
