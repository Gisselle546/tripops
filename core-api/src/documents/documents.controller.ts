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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

@Controller('trips/:tripId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  upload(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required.');
    return this.documentsService.uploadDocument(
      req.user.userId,
      tripId,
      dto,
      file,
    );
  }

  @Get()
  list(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.documentsService.listDocuments(req.user.userId, tripId);
  }

  @Get(':docId')
  getOne(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.getDocument(req.user.userId, tripId, docId);
  }

  @Get(':docId/download')
  download(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.getDownloadUrl(req.user.userId, tripId, docId);
  }

  @Patch(':docId')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  update(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('docId') docId: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(
      req.user.userId,
      tripId,
      docId,
      dto,
    );
  }

  @Delete(':docId')
  remove(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.deleteDocument(req.user.userId, tripId, docId);
  }
}
