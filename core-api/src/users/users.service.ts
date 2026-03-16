import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createLocalUser(input: {
    email: string;
    passwordHash: string;
    fullName?: string;
  }) {
    const user = this.usersRepo.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      fullName: input.fullName,
    });
    return this.usersRepo.save(user);
  }
}
