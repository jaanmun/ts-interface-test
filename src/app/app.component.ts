import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';
import { AlertService } from 'src/services/alert.service';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  //백버튼 시간
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  constructor(
    private platform: Platform,
    private router: Router,
    public navc: NavController,
    public alertService: AlertService
  ) {
    this.initializeApp();
    this.backbutton();
  }

  //시작시 세팅

  //시작시 세팅
  async initializeApp() {
    ///TODO 안예쁘긴 한데 이게 최선이에요
    this.platform.ready().then(async (data) => {
      //디바이스 정보 가져오기
      const deviceInfo = await Device.getInfo();
      //서버로 돌릴때 진행하지 않기
      if (!this.platform.is('capacitor')) {
        return false;
      }

      //디바이스가 안드로이 12 이상일때 옵션
      if (
        deviceInfo.platform == 'android' &&
        Number(deviceInfo.osVersion) > 11
      ) {
        //유저 폰트 크기 고정
        await TextZoom.set({ value: 1 });

        SplashScreen.hide().then(async (data) => {
          await SplashScreen.show({
            autoHide: false,
          });

          setTimeout(async () => {
            await StatusBar.setBackgroundColor({
              color: '#ffffff',
            });
            await StatusBar.setOverlaysWebView({
              overlay: false,
            });
            await StatusBar.setStyle({
              style: Style.Light,
            });
            await SplashScreen.hide();
          }, 500);
        });
      } else {
        //그외
        await TextZoom.set({ value: 1 });

        await StatusBar.setStyle({
          style: Style.Light,
        });

        if (deviceInfo.platform == 'android') {
          await StatusBar.setBackgroundColor({
            color: '#ffffff',
          });
          await StatusBar.setOverlaysWebView({
            overlay: false,
          });
        }
        await SplashScreen.hide();
      }
    });
  }

  //백버튼 기본 셋팅
  backbutton() {
    this.platform.backButton.subscribeWithPriority(0, async () => {
      let url = this.router.url;

      switch (url) {
        case '/':
        case '/tabs/home': {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator['app'].exitApp();
          } else {
            this.alertService.presentToast('다시 한번 누르면 종료됩니다.');
            this.lastTimeBackPress = new Date().getTime();
          }
          break;
        }

        default: {
          this.navc.pop();
          break;
        }
      }
    });
  }
}
