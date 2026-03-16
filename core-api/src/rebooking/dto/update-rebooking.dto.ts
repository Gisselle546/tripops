import { PartialType } from '@nestjs/mapped-types';
import { CreateRebookingDto } from './create-rebooking.dto';

export class UpdateRebookingDto extends PartialType(CreateRebookingDto) {}
