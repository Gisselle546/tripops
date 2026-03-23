import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { DocumentCategory } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileType?: string;
}
