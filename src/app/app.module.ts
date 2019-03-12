import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { File } from '@ionic-native/file';
import { Media, MediaObject } from '@ionic-native/media';
//pages
import { NewIssue } from '../pages/new-issue/new-issue';
import { EvotorApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { VoiceForm } from '../pages/modals/voice-form/voice-form';
//providers
import { EquipmentService } from '../providers/equipment-service';
import { CurrentEquipmentProvider } from '../providers/current-equipment-provider';
import { DbService } from '../providers/db-service';
import { LoaderProvider } from '../providers/loader-provider';
import { AuthService } from '../providers/auth-service';
import { IssuesService } from '../providers/issues-service';
import { RequestService } from '../providers/request-service';
import { NetworkService } from '../providers/network-service';
import { HttpClientModule } from '@angular/common/http';
// Models and aggregations
import { SettingsModel } from '../models/settings-model';
//Utils
import { RollbarErrorHandler } from './rollbar.handler';
import { AppConfig } from './app-config';

// Directives
import { ClickGeneratedLinkDirective } from '../../src/app/click-generated-link.directive';

@NgModule({
  declarations: [
    EvotorApp,
    HomePage,
    LoginPage,
    NewIssue,
    VoiceForm,
    ClickGeneratedLinkDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(EvotorApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    EvotorApp,
    HomePage,
    LoginPage,
    NewIssue,
    VoiceForm,
  ],
  providers: [
    AppConfig,
    CurrentEquipmentProvider,
    EquipmentService,
    DbService,
    Network,
    StatusBar,
    AuthService,
    Media,
    File,
    NetworkService,
    SplashScreen,
    SettingsModel,
    IssuesService,
    LoaderProvider,
    RequestService,
    LoaderProvider,
    RollbarErrorHandler,
    {provide: ErrorHandler, useClass: RollbarErrorHandler}
  ]
})
export class AppModule {}
