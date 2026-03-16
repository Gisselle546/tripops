import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            createLocalUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mock-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
            getOrThrow: jest
              .fn()
              .mockReturnValue('test-secret-at-least-20-chars'),
          },
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
