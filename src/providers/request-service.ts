import { Injectable } from '@angular/core';
import { AlertController, Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service';
import { NetworkService } from './network-service';
import { AppConfig } from '../app/app-config';
import { timer } from "rxjs/observable/timer";
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class RequestService {
  unauthorizedAlertPresent: boolean = false;

  constructor(public http: HttpClient,
              public events: Events,
              public alertCtrl: AlertController,
              public authService: AuthService,
              public networkService: NetworkService,
              public config: AppConfig) {
  }

  public fullPath(path): string {
    return `${this.config.domainUrl}evotor/${path}`;
  }

  public get(path: string, options: any = {}) {
    if(this.networkService.hasConnection()){
      return this.http
                 .get(this.fullPath(path), { params: options, headers: this.config.requestHeaders() })
                 .retryWhen(attempts => {
                   let count = 1;
                   return attempts.mergeMap(error => {
                     if(++count>3) return Promise.reject(error);
                     return timer(count * 2000);
                   })
                 })
                 .toPromise()
                 .then(response => Promise.resolve(response))
                 .catch(errorResponse => this.performErrorResponse(errorResponse));
    } else {
      this.networkService.showNetworkAlert();
      return Promise.reject(false);
    }
  }

  public post(path, data) {
    if(this.networkService.hasConnection()){
      return this.http
                 .post(this.fullPath(path), data, { headers: this.config.requestHeaders() })
                 .retryWhen(attempts => {
                    let count = 1;
                    return attempts.mergeMap(error => {
                      if(++count>3) return Promise.reject(error);
                      return timer(count * 2000);
                    })
                  })
                 .toPromise()
                 .then(response => response)
                 .catch(errorResponse => this.performErrorResponse(errorResponse));
    } else {
      this.networkService.showNetworkAlert();
      return Promise.reject(false);
    }
  }

  public postWithAttachments(path, data): Promise<any> {
    // console.log(`${path} post with attachments started...`);
    if(this.networkService.hasConnection()){
      return this.prepareFormData(data)
                 .then(form => this.sendRequest(this.fullPath(path), form));
     } else {
       this.networkService.showNetworkAlert();
       return Promise.reject(false);
     }
  }

  private prepareFormData(data:any): Promise<FormData> {
    let form = new FormData();
    let resourceName = data.resourceName;
    let attachmentsFormName = resourceName ? `${resourceName}[attachments]` : 'attachments';
    if(data.resource){
      for(let key in data.resource){
        if(data.resource.hasOwnProperty(key)){
          let value = data.resource[key];
          if(value instanceof Object){
            if(value instanceof Array){
              for(let i=0; i < value.length; i++){
                form.append(`${resourceName}[${key}][]`, value[i]);
              }
              continue;
             }
            for(let objKey in value){
              if(value.hasOwnProperty(objKey)){
                let objValue = value[objKey];
                if(objValue instanceof Array){
                    for(let i=0; i < objValue.length; i++){
                      form.append(`${resourceName}[${key}][${objKey}][]`, objValue[i]);
                    }
                } else {
                  form.append(`${resourceName}[${key}][${objKey}]`, objValue);
                }
              }
            }
          } else {
            form.append(`${resourceName}[${key}]`, value);
          }
        }
      }
    }

    if(data.attachments.length > 0){
      return this.appendAttachments(form, data.attachments, attachmentsFormName);
    }else{
      return Promise.resolve(form);
    }
  }

  private appendAttachments(form, attachments, resourceKey): Promise<FormData>{
    let readedAttachments = attachments.map((attachment, index) => {
      return new Promise ((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = (e) => {
          var fileBlob = new Blob([reader.result], { type: attachment.fileInfo.type });
          form.append(`${resourceKey}[${index}][attachment]`, fileBlob, attachment.fileInfo.name);
          form.append(`${resourceKey}[${index}][description]`, attachment.description);
          form.append(`${resourceKey}[${index}][is_public]`, attachment.is_public);
          resolve(true);
        };
        reader.readAsArrayBuffer(attachment.fileInfo);
      });
    });

    return Promise.all(readedAttachments).then(res => {
      return form;
    });
  }

  private sendRequest(path: string, form: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('POST', path);
      request.setRequestHeader('X-Okdesk-Authorization', 'Bearer ' + localStorage.getItem('id_token'));
      request.setRequestHeader('Accept', this.config.acceptHeader());
      request.onload = event => {
        if(request.status == 200){
          resolve(JSON.parse(request.response));
        }else{
          this.performErrorResponse(request);
          reject(JSON.parse(request.response));
        }
      }
      request.onerror = event => reject(JSON.parse(request.response));
      request.send(form);
    });
  }

  private performErrorResponse(response: any): void {
    switch(response.status){
      case 401:
        let unauthorizedAlert = this.alertCtrl.create({
          title: 'Вы не авторизованы',
          subTitle: 'Необходима авторизация',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.events.publish('equipment:logout');
              this.unauthorizedAlertPresent = false;
            }
          }]
        })
        if(!this.unauthorizedAlertPresent) {
          unauthorizedAlert.present();
          this.unauthorizedAlertPresent = true;
        }
        break;
      case 403:
        this.alertCtrl.create({
          title: 'Доступ запрещен',
          subTitle: 'У вас нет доступа на запрашиваемое действие',
          buttons: ['OK']
        }).present();
        break;
      case 415:
        this.events.publish('equipment:force_update');
        break;
      case 422:
        break;
      default:
        throw response;
    }
  }
}
