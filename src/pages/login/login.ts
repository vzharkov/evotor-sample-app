import { Component, ViewChild } from '@angular/core';
import { AlertController, Events } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../providers/auth-service';
import { Login } from '../../models/forms/login';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  model: Login;
  errors: any = {};
  sending: boolean = false;

  constructor(public auth: AuthService,
              public events: Events,
              public alertCtrl: AlertController){
    if(this.auth.authenticated()){
      this.events.publish('equipment:loggedin');
    }else{
      this.auth.logout();
      this.login();
    }
  }

  login(): void {
    if(this.sending) return;
    this.errors = {};
    // this.validate();
    this.sending = true;
    this.auth.login({
      authentication_code: '6190424767302561' // auth code for equipment for test
    }).then((success) => {
      this.events.publish('equipment:loggedin');
      this.sending = false;
    }).catch(err => {
      this.errors = err;
      this.sending = false;
    });
  }
}
