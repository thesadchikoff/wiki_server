import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateNoteDto, SearchDto } from './dto/create-note.dto';
import { NoteModeratorAction, UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

type RequestWithUser = Request & { user: User };

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNoteDto: CreateNoteDto, @Req() req: RequestWithUser) {
    return this.notesService.create(createNoteDto, req.user['sub']);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.notesService.findAll(id);
  }

  @Get('one/:id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Post('/search/:id/:page')
  searchNote(
    @Body() dto: SearchDto,
    @Param('id') categoryId: string,
    @Param('page') page: string,
  ) {
    return this.notesService.searchNote(dto, categoryId, page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('useful/:id')
  usefulNote(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notesService.usefulNote(req.user['sub'], id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dis-useful/:id')
  disUsefulNote(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notesService.disUsefulNote(req.user['sub'], id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/toggle-actual-note/:id')
  toggleActualNote(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notesService.actualNote(id, req.user['sub']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('note-pinned-toggle/:id')
  togglePinnedNote(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notesService.pinnedToggle(req.user['sub'], id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.notesService.update(updateNoteDto, id, req.user['sub']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/moderation/:id')
  getNotesForModeration(@Req() req: RequestWithUser, @Param('id') id: string) {
    console.log('Start note controller');
    return this.notesService.getNotesForModeration(req.user['sub'], id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/accept-or-decline')
  async checkNotesByModers(
    @Req() req: RequestWithUser,
    @Body() param: NoteModeratorAction,
  ) {
    return this.notesService.acceptNoteByModerator(req.user['sub'], param);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notesService.remove(id, req.user['sub']);
  }
}
