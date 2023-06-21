import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InterfacePage } from './interface.page';

const routes: Routes = [
  {
    path: '',
    component: InterfacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InterfacePageRoutingModule {}
