import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { EquipmentService } from './equipment-service';

@Injectable()
export class CurrentEquipmentProvider {
  public equipment: any = {};

  constructor(public events: Events,
              public equipmentService: EquipmentService) {
    this.equipment = JSON.parse(localStorage.getItem('equipment_info'));
    this.events.unsubscribe('equipment:update');
    this.events.subscribe('equipment:update', (equipmentInfo) => {
      this.equipment = equipmentInfo;
    });
  }

  public getEquipmentId(): string {
    return this.equipment && this.equipment.id;
  }
}
