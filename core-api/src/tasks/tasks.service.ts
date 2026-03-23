import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { TripMemberStatus } from '../trips/entities/trip-member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
    private readonly eventsService: EventsService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  private toDto(t: Task) {
    return {
      id: t.id,
      tripId: t.tripId,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      dueDate: t.dueDate ?? null,
      assigneeUserId: t.assigneeUserId ?? null,
      createdByUserId: t.createdByUserId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async createTask(userId: string, tripId: string, dto: CreateTaskDto) {
    await this.assertTripAccess(userId, tripId);

    const task = await this.tasksRepo.save(
      this.tasksRepo.create({
        tripId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
        assigneeUserId: dto.assigneeUserId,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.TASK_CREATED,
      aggregateId: task.id,
      aggregateType: 'Task',
      actorUserId: userId,
      tripId,
      data: { title: task.title },
    });

    return this.toDto(task);
  }

  async listTasks(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);
    const tasks = await this.tasksRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
    return tasks.map((t) => this.toDto(t));
  }

  async getTask(userId: string, tripId: string, taskId: string) {
    await this.assertTripAccess(userId, tripId);
    const task = await this.tasksRepo.findOne({
      where: { id: taskId, tripId },
    });
    if (!task) throw new NotFoundException('Task not found.');
    return this.toDto(task);
  }

  async updateTask(
    userId: string,
    tripId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    const task = await this.tasksRepo.findOne({
      where: { id: taskId, tripId },
    });
    if (!task) throw new NotFoundException('Task not found.');

    const wasCompleted = task.status === TaskStatus.COMPLETED;
    Object.assign(task, dto);
    const saved = await this.tasksRepo.save(task);

    const isNowCompleted =
      saved.status === TaskStatus.COMPLETED && !wasCompleted;

    await this.eventsService.publish({
      type: isNowCompleted
        ? DomainEvents.TASK_COMPLETED
        : DomainEvents.TASK_UPDATED,
      aggregateId: saved.id,
      aggregateType: 'Task',
      actorUserId: userId,
      tripId,
      data: { title: saved.title, status: saved.status },
    });

    return this.toDto(saved);
  }

  async deleteTask(userId: string, tripId: string, taskId: string) {
    await this.assertTripAccess(userId, tripId);

    const task = await this.tasksRepo.findOne({
      where: { id: taskId, tripId },
    });
    if (!task) throw new NotFoundException('Task not found.');

    await this.tasksRepo.remove(task);

    await this.eventsService.publish({
      type: DomainEvents.TASK_DELETED,
      aggregateId: taskId,
      aggregateType: 'Task',
      actorUserId: userId,
      tripId,
      data: { title: task.title },
    });

    return { ok: true };
  }
}
