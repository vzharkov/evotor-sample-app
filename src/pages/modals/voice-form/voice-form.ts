import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import { LoaderProvider } from '../../../providers/loader-provider';
import { File } from '@ionic-native/file';

declare var resolveLocalFileSystemURL:any;

@Component({
  selector: 'voice-form-popover',
  templateUrl: 'voice-form.html'
})
export class VoiceForm {
  beep_sound: MediaObject;
  voice_recording_button_text: string = "Нажмите и удерживайте для записи сообщения";
  has_record: boolean = false;
  record_started: boolean = false;
  record_file: any = {};
  start_voice_recording: boolean = false;
  file_name: string;
  record: any = {};
  errors: any = {};
  fromIssue: boolean = false;

  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              public media: Media,
              public file: File,
              public loader: LoaderProvider) {
    this.record = null;
    this.beep_sound = this.media.create(this.getBeepSoundFilePath());
    this.fromIssue = this.params.get('fromIssue') || false;
    this.setFileName();
  }

  startRecording(): void {
    this.record_started = true;
    this.playBeep();
    this.file.createFile(this.file.externalCacheDirectory, this.file_name, true).then(() => {
      this.record_file = this.media.create(this.file.externalCacheDirectory.replace(/^file:\/\//, '') + this.file_name);
      this.record_file.onError.subscribe(error => this.errors = error);
      if(this.record_started) {
        this.record_file.startRecord();
        this.voice_recording_button_text = "Говорите. Производится запись сообщения";
        this.start_voice_recording = true;
      }
    });
  }

  stopRecording(): any {
    if(!this.start_voice_recording) return this.record_started = false;
    this.start_voice_recording = false;
    this.voice_recording_button_text = "Нажмите и удерживайте для записи сообщения";
    this.record_file.stopRecord();
    this.resolveFileSystemUrl();
    this.playBeep();
  }

  playBeep(): void {
    this.beep_sound.play();
    setTimeout(() => this.beep_sound.stop(), 500);
  }

  setFileName(): void {
    const nameType = this.fromIssue ? 'заявке' : 'комментарию';
    this.file_name = `Голосовое сообщение к ${nameType}_${Date.now()}.mp3`;
  }

  private resolveFileSystemUrl(): Promise<any> {
    this.loader.show();
    return new Promise((resolve, reject) => {
      resolveLocalFileSystemURL(this.file.externalCacheDirectory+this.file_name, fileEntry => {
        fileEntry.file(fileInfo => {
          this.record = fileInfo;
          this.has_record = true;
          this.loader.hide();
        });
      }, err => {
        this.errors = err;
        this.loader.hide();
      });
    });
  }

  submit(): void {
    this.viewCtrl.dismiss({
      fileInfo: this.record,
      description: '',
      is_public: true
    });
  }

  reset(): void {
    this.has_record = false;
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  getBeepSoundFilePath(): string {
    return `${this.file.applicationDirectory}www/assets/voice_record_sound.wav`;
  }
}
