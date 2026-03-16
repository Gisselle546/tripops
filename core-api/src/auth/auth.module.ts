import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Auth]),
    JwtModule.register({}), // we pass secrets at sign time
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
