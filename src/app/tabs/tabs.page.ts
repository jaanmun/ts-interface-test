import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor(private router: Router, private routerOutlet: IonRouterOutlet) {}

  ngOnInit(): void {
    //특정 url swipe back 막기
    this.setNoSwipe();
  }

  //특정 url swipe back 막기
  setNoSwipe() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let url = e.url;
        let splitUrl = url.split('/');
        let path = '/' + splitUrl[1];

        //아래 주석을 풀어서 특정 url 만 스와이프 막기
        // if (path.includes('해당 url')) {
        //   this.routerOutlet.swipeGesture = false;

        // } else {
        //   this.routerOutlet.swipeGesture = true;

        // }
      }
    });
  }
}
