import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';
import { AlertService } from 'src/services/alert.service';

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
  initializeApp() {
    this.platform.ready().then((data) => {
      if (this.platform.is('capacitor')) {
        //유저 폰트 크기 고정
        TextZoom.set({ value: 1 });

        //ligth 콘텐츠
        StatusBar.setStyle({
          style: Style.Light,
        });

        if (this.platform.is('android')) {
          //해당 코드는 안드로이드만 적용 가능 코드입니다.
          StatusBar.setBackgroundColor({
            color: '#ffffff',
          });
          StatusBar.setOverlaysWebView({
            overlay: false,
          });
        }

        //스플레시 끝 임시
        setTimeout(() => {
          SplashScreen.hide();
        }, 500);
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
