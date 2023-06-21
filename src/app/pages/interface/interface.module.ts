import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InterfacePageRoutingModule } from './interface-routing.module';

import { InterfacePage } from './interface.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InterfacePageRoutingModule
  ],
  declarations: [InterfacePage]
})
export class InterfacePageModule {}
