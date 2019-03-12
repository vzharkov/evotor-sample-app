import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Events, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { AuthService } from '../providers/auth-service';
import { NetworkService } from '../providers/network-service';
import { DbService } from '../providers/db-service';
import { CurrentEquipmentProvider } from '../providers/current-equipment-provider';
import { SettingsModel } from '../models/settings-model';
import { AppConfig } from './app-config';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NewIssue } from '../pages/new-issue/new-issue';

@Component({
  templateUrl: 'app.html'
})
export class EvotorApp {
  showMenu: boolean = false;
  rootPage:any = HomePage;
  @ViewChild('myNav') nav: NavController

  constructor(platform: Platform,
              public config: AppConfig,
              public events: Events,
              public dbService: DbService,
              private auth: AuthService,
              public networkService: NetworkService,
              public modalCtrl: ModalController,
              public statusBar: StatusBar,
              public settingsModel: SettingsModel,
              public currentEquipmentProvider: CurrentEquipmentProvider,
              public splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.events.unsubscribe('equipment:loggedin');
      this.events.subscribe('equipment:loggedin', () => {
        this.config.setDomain();
        this.dbService.initDb(this.currentEquipmentProvider.getEquipmentId()).then((success) => {
          this.loadAccountSettings();
          document.addEventListener('pause', () => {
            this.dbService.db && this.dbService.db.save();
          });
          this.events.publish('lokidb:loaded');
          this.showMenu = true;
          this.nav.setRoot(NewIssue);
        }).catch(err => {
        });
      });

      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#8c9eb2');

      splashScreen.hide();
      if(!this.auth.authenticated()){
        this.logout();
      }else{
        this.events.publish('equipment:loggedin');
      }
      this.events.unsubscribe('equipment:logout');
      this.events.subscribe('equipment:logout', () => this.logout());
    });
  }

  loadAccountSettings(): void {
    this.networkService.whenConnected().then(() => {
      this.settingsModel.loadAccountSettings();
    });
  }

  logout(): void {
    this.auth.logout();
    this.showMenu = false;
    this.nav.setRoot(LoginPage);
  }
}
