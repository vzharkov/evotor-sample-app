import { Injectable } from '@angular/core';
import { DbService } from '../providers/db-service';
import { NetworkService } from '../providers/network-service';
import { EquipmentService } from '../providers/equipment-service';

@Injectable()
export class SettingsModel {

  constructor(public dbService: DbService,
              public networkService: NetworkService,
              public equipmentService: EquipmentService) {}

  loadAccountSettings(): Promise<boolean> {
    if(this.networkService.hasConnection()) {
      return this.equipmentService.getAccountSettings().then(settings => {
        // console.log(settings);
        if(settings) {
          this.dbService.saveAccountSettings(settings);
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      });
    } else {
      this.networkService.showNetworkAlert();
      return Promise.resolve(false);
    }
  }

  getSetting(settingsName: string, reload = false): any {
    if(reload) this.loadAccountSettings();
    let setting = this.dbService.getAccountSetting(settingsName);
    return setting && setting.value;
  }
}
