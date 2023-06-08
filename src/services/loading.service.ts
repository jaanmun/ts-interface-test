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
    if (!this.loading) {
      this.loading = await this.loader.create({
        duration: 5000,
        translucent: true,
        backdropDismiss: false,
        message,
      });
      await this.loading.present();

      this.loading.onDidDismiss().then((dismiss) => {
        this.loading = null;
      });
    }
  }

  hide() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }
}
