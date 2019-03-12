import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class AppConfig {
  // domainUrl: string = 'http://192.168.1.94:3000/';
  // domainUrl: string = 'http://192.168.1.173:3000/';
  // domainUrl: string = 'https://evotor.okdesk.ru/';
  domainUrl: string = 'https://evotor.ticketrocket.ru/';
  apiVersion: string = 'v1';

  constructor() {

  }

  public setDomain(): void {
    let domainUrl = localStorage.getItem('domainUrl');
    if(domainUrl) {
      this.domainUrl = domainUrl;
    }
  }

  public setAccountToDomain(account: string): void {
    // this.domainUrl = `https://${account}.okdesk.ru/`;
    this.domainUrl = `https://${account}.ticketrocket.ru/`;
    localStorage.setItem('domainUrl', this.domainUrl);
  }

  public requestHeaders(): HttpHeaders {
    return new HttpHeaders({
      "X-Okdesk-Authorization": 'Bearer ' + localStorage.getItem('id_token'),
      "Content-Type": "application/json",
      "Accept": this.acceptHeader()
    });
  }

  public loginRequestHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Accept": this.acceptHeader()
    });
  }

  public acceptHeader(): string {
    return `application/vnd.okdesk.evotor.mobile.${this.apiVersion}`;
  }
}
