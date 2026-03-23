import { IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { DocumentCategory } from '../entities/document.entity';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileType?: string;
}
