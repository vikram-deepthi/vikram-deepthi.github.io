import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { TileComponent } from './tile/tile.component';
import { NewsComponent } from './news/news.component';
import { MyHrComponent } from './myhr/myhr.component';

@NgModule({
  declarations: [AppComponent, TileComponent, NewsComponent, MyHrComponent],
  imports: [BrowserModule, HttpClientModule, NgxJsonViewerModule, CommonModule,
    RouterModule.forRoot([
      {path: '', component: TileComponent},
      {path: 'preview', component: TileComponent},
      {path: 'news/:id', component: NewsComponent},
      {path: 'preview/news/:id', component: NewsComponent},
      {path: 'myHR', component: MyHrComponent},
      {path: 'preview/myHR', component: MyHrComponent},
  ]),],
  providers: [],
  bootstrap: [AppComponent, TileComponent, NewsComponent, MyHrComponent],
})
export class AppModule {}
