import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { AlertController } from 'ionic-angular';

@Injectable()
export class NetworkService {
  connectSubsctiption: any;
  alertPresent: boolean = false;

  constructor(public alertCtrl: AlertController,
              public network: Network){}

  hasConnection(){
    return this.network.type !== 'none';
  }

  showNetworkAlert(message: string = null){
    let alert = this.alertCtrl.create({
      title: 'Отсутствует интернет-соединение',
      subTitle: message || 'Приложение работает в оффлайн-режиме',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.alertPresent = false;
        }
      }]
    });
    if(!this.alertPresent) {
      alert.present();
      this.alertPresent = true;
    }
  }

  whenConnected(): Promise<any> {
    return new Promise((resolve, reject) => {
      if(this.hasConnection()){
        resolve(true);
      } else {
        this.showNetworkAlert();
        reject();
      }
    });
  }

  onConnect(connectCallback) {
    if(this.connectSubsctiption){
      this.connectSubsctiption.unsubscribe();
    }
    this.connectSubsctiption = this.network.onConnect().subscribe(connectCallback);
  }
}
