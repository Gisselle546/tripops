import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            listForUser: jest.fn().mockResolvedValue({ items: [], total: 0, unreadCount: 0 }),
            unreadCount: jest.fn().mockResolvedValue(0),
            markAsRead: jest.fn().mockResolvedValue({ ok: true }),
            markAllAsRead: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
