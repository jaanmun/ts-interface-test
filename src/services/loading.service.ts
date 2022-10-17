import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public loading;
  public isLoading = false;
  constructor(public loader: LoadingController) {}

  async load(message?) {
    this.loading = await this.loader.create({
      duration: 5000,
      translucent: true,
      // cssClass: '',
      backdropDismiss: false,
      message,
    });
    await this.loading.present();
  }

  hide() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async lognLoad(message?) {
    this.loading = await this.loader.create({
      translucent: true,
      // cssClass: '',
      backdropDismiss: false,
      message,
    });
    await this.loading.present();
  }
}
