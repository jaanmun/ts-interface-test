import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/// firebase ///

// import { environment } from 'src/environments/environment';
// import {
//   FirestoreModule,
//   getFirestore,
//   provideFirestore,
// } from '@angular/fire/firestore';
// import {
//   FirebaseAppModule,
//   initializeApp,
//   provideFirebaseApp,
// } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { provideStorage, getStorage } from '@angular/fire/storage';
// import { provideFunctions, getFunctions } from'@angular/fire/functions';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    IonicModule.forRoot({ mode: 'ios' }),
    AppRoutingModule,
    // FirestoreModule,
    // FirebaseAppModule,
    // provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),
    // provideStorage(() => getStorage()),
    // provideFunctions(() => getFunctions()),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
