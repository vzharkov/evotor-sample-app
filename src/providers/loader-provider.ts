import { Injectable } from '@angular/core';
import { LoadingController, Loading } from 'ionic-angular';

@Injectable()
export class LoaderProvider {
  loader: Loading = null;
  visible: Boolean = false;
  readonly loadingOptions: any = {
    content: 'Пожалуйста, подождите...'
  };

  constructor(private loadingCtrl: LoadingController) {
    // console.log('loader created');
  }

  show(): void {
    // console.log(`from show: ${this.visible}`);
    if(!this.visible) {
      this.visible = true;
      if(!this.loader) {
        this.loader = this.loadingCtrl.create(this.loadingOptions);
      }
      this.loader.present();
    }
  }

  hide(): void {
    // console.log(`from hide: ${this.visible}`);
    if(this.visible) {
      this.visible = false;
      setTimeout(() => {
        this.loader && this.loader.dismiss().then(() => {
          this.loader = null;
        }).catch(() => {});
      }, 300);
    }
  }
}
