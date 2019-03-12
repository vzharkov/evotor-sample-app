import { Injectable } from '@angular/core';
import { RequestService } from './request-service';

@Injectable()
export class EquipmentService {

  constructor(public requestService: RequestService) {}

  public getAccountSettings() {
    return this.requestService.get('settings');
  }
}
