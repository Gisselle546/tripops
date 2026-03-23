import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('trips/:tripId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  create(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(req.user.userId, tripId, dto);
  }

  @Get()
  list(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.tasksService.listTasks(req.user.userId, tripId);
  }

  @Get(':taskId')
  getOne(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.getTask(req.user.userId, tripId, taskId);
  }

  @Patch(':taskId')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  update(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(req.user.userId, tripId, taskId, dto);
  }

  @Delete(':taskId')
  remove(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.deleteTask(req.user.userId, tripId, taskId);
  }
}
