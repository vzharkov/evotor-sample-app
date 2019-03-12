import { PipeTransform } from '@angular/core';

export class VoiceCommentPipe  implements PipeTransform {
  voiceComment: string = 'Голосовое сообщение добавлено к заявке как файл';
  constructor(){}

  transform(comment: string): string {
    if(comment === undefined) return this.voiceComment;
    return comment && comment.includes(this.voiceComment) ? comment : [comment, this.voiceComment].join('\n');
  }
}
