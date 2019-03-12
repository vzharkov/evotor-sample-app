import { ErrorHandler, Injectable } from '@angular/core';
declare var Rollbar: any;

@Injectable()
export class RollbarErrorHandler extends ErrorHandler {
  constructor() {
      super();
  }

  handleError(e:any) {
    if (Rollbar) {
      // Send the error to Rollbar
      let accountInfo = localStorage.getItem('equipment_info');
      Rollbar.error(e, { currentAccountInfo: accountInfo });
      // console.log(`Error: ${e}`);
    }
  }
}
