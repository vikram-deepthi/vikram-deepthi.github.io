import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes),
            HttpClientModule],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
