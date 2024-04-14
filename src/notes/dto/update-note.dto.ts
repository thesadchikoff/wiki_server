import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  title?: string;
  content?: string;
}
const enum MODERATOR_ACTION {
  ACCEPT = 'ACCEPT',
  UNACCEPT = 'UNACCEPT',
}

export class NoteModeratorAction {
  noteId: string;
  type: MODERATOR_ACTION;
}
