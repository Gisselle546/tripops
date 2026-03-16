import { PartialType } from '@nestjs/mapped-types';
import { CreateCollabDto } from './create-collab.dto';

export class UpdateCollabDto extends PartialType(CreateCollabDto) {}
