import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { NetworkService } from './network-service';
import { AppConfig } from '../app/app-config';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {
    loginUrl: string;
    constructor(private http: HttpClient,
                public events: Events,
                public networkService: NetworkService,
                public config: AppConfig) {
    }

    public authenticated() {
      return localStorage.getItem('id_token');
    }

    login(credentials) {
      if(this.networkService.hasConnection()){
        this.loginUrl = `${this.config.domainUrl}evotor/auth/`;
        return new Promise((resolve, reject) => {
          this.http.post(this.loginUrl, JSON.stringify(credentials), { headers: this.config.loginRequestHeaders() })
            .subscribe(
              data => {
                if(data) {
                  this.authSuccess(data['id_token']);
                  this.setEquipment(data['equipment'])
                  localStorage.setItem('equipment_account', data['account']);
                  resolve(data);
                } else {
                  reject(false);
                }
              }, err => {
                let errors;
                errors = err.error && err.error.errors;
                reject(errors);
              });
        });
      } else {
        this.networkService.showNetworkAlert('Проверьте подключение к интернету');
        return Promise.reject(false);
      }
    }

    private setEquipment(equipmentInfo): void {
      this.config.setAccountToDomain(equipmentInfo['account']);
      localStorage.setItem('equipment_info', JSON.stringify(equipmentInfo));
      this.events.publish('equipment:update', equipmentInfo);
    }

    logout() {
      localStorage.removeItem('id_token');
    }

    authSuccess(token) {
      localStorage.setItem('id_token', token);
    }

    getToken() :string {
      if(this.authenticated()){
        return localStorage.getItem('id_token');
      }else{
        return '';
      }
    }
}
