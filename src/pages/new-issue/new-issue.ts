import { Component, ViewChild, Renderer, NgZone } from '@angular/core';
import { NavController, ModalController, Content, Events, TextInput, AlertController } from 'ionic-angular';
import { IssuesService } from '../../providers/issues-service';
import { DbService } from '../../providers/db-service';
import { LoaderProvider } from '../../providers/loader-provider';
import { NetworkService } from '../../providers/network-service';
import { NewIssueForm } from '../../models/forms/new-issue';
import { SettingsModel } from '../../models/settings-model';
import { VoiceForm } from '../modals/voice-form/voice-form';
import { VoiceCommentPipe } from '../../pipes/voice-comment.pipe';

@Component({
  selector: 'page-new-issue',
  templateUrl: 'new-issue.html'
})
export class NewIssue {
  model: NewIssueForm;
  types: any;
  priorities: any;
  customParameters: any;
  errors: any = {};
  attachments: Array<any> = [];
  send_voice_issue_button: string = 'Отправить голосовую заявку';

  descriptionVisible: boolean = false;
  dirtyAssignee: boolean = false;
  monthNames: any = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май',
                               'Июнь', 'Июль', 'Август', 'Сентябь', 'Октябрь',
                               'Ноябрь', 'Декабрь'];
  sending: boolean = false;
  currentDate: string = '';
  @ViewChild(Content) content: Content;
  @ViewChild('issueDescription') issueDescription:TextInput;

  constructor(public nav: NavController,
              public modalCtrl: ModalController,
              public events: Events,
              public renderer: Renderer,
              public ngZone: NgZone,
              public loader: LoaderProvider,
              public issuesService: IssuesService,
              public networkService : NetworkService,
              public dbService: DbService,
              public settingsModel: SettingsModel,
              public alert: AlertController) {
    this.model = new NewIssueForm;
    this.setCurrentDate();
  }

  ionViewWillEnter() {
    this.initCollections();
  }

  setCurrentDate() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    this.currentDate = (new Date(Date.now() - tzoffset)).toISOString();
  }

  showVoiceIssueForm(): void {
    let voiceIssueFormModal = this.modalCtrl.create(VoiceForm, { fromIssue: true });
    voiceIssueFormModal.onDidDismiss((record) => {
      if(record) {
        this.attachments.push(record);
        this.model.title = 'Голосовое сообщение со Смарт-терминала';
        this.descriptionVisible = true;
        this.model.description = new VoiceCommentPipe().transform(this.model.description);
      }
    })
    voiceIssueFormModal.present();
  }

  initCollections(): void {
    this.loader.show();
    Promise.all([this.issuesService.getIssueTypes(),
                 this.issuesService.getIssuePriorities(),
                 this.settingsModel.loadAccountSettings()]).then(collections => {
      [this.types, this.priorities,] = collections;
      this.setDefaultTypesAndPrioriries();
      this.setCustomParameters();
    }).catch(err => {
      this.loader.hide();
    });
  }

  setDefaultTypesAndPrioriries(): void {
    let default_type = this.types.filter(type => type.default === true)[0];
    this.model.work_type_id = default_type && default_type.id || this.types[0].id;
    let default_priority = this.priorities.filter(priority => priority.default === true)[0];
    this.model.priority_id = default_priority && default_priority.id || this.priorities[0].id;
  }

  setCustomParameters(): void {
    this.issuesService.getCustomParameters(this.model.work_type_id).then(parameters => {
      this.customParameters = parameters;
      this.loader.hide();
    }).catch(() => {
      this.loader.hide();
    });
  }

  typeChange(): void {
    this.loader.show();
    this.setCustomParameters();
  }

  onSubmit(event): void {
    if(this.sending) return;
    event.preventDefault();
    if(!this.isValid()){
      this.scrollToError();
      return;
    }
    this.sending = true;
    this.errors = {};
    this.networkService.whenConnected().then(() => {
      this.issuesService.createIssue({
        resourceName: 'issue',
        resource: this.model,
        attachments: this.attachments
      }).then(
        (issue) => {
          if(issue) {
            this.dbService.saveIssue(issue);
            // this.nav.pop();
            // this.events.publish('outdated:issues_list');
            // this.nav.push(IssueCard, { issueId: issue['sequential_id'] });
            this.alert.create({
              'title': 'Success',
              'buttons': ['OK']
            }).present();
            this.nav.setRoot(NewIssue);
          }
        },
        (err) => {
          this.sending = false;
          this.errors = err && err.errors;
          this.scrollToError();
          this.alert.create({
            'title': 'Error',
            'buttons': ['OK']
          }).present();
        }
      );
    }).catch(() => {
      this.sending = false;
      this.alert.create({
        'title': 'Error',
        'buttons': ['OK']
      }).present();
    });
  }

  isValid(): boolean {
    this.errors = {};
    let result = true;
    if(!this.model.title || this.model.title === '') {
      this.errors['title'] = ['не может быть пустым'];
      result = false;
    }
    this.customParameters.filter((param) => param.required).forEach((param) => {
      if(!this.model.custom_parameters || !this.model.custom_parameters[param.code] ||
         this.model.custom_parameters[param.code] === '') {
         if(!this.errors['custom_parameters']) {
           this.errors['custom_parameters'] = {};
         }
        this.errors['custom_parameters'][param.code] = ['не может быть пустым'];
        result = false;
      }
    });
    return result;
  }

  scrollToError(): void {
    setTimeout(() => {
      let firstErrorElement = document.getElementsByClassName('form-errors')[0];
      if(firstErrorElement) {
        let ionItem = firstErrorElement.previousElementSibling;
        ionItem.scrollIntoView();
      }
    }, 300);
  }

  goBack(): void {
    this.nav.pop();
  }

  showDescription() {
    this.descriptionVisible = true;
    this.ngZone.runOutsideAngular(() => setTimeout(() => {
      this.renderer.invokeElementMethod(
        this.issueDescription.getNativeElement(), 'focus', []);
      setTimeout(() => this.issueDescription.getNativeElement().scrollIntoView(), 300);
    }));
  }
}
