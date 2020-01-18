import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { OptionsComponent } from './options/options.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { CardFrontComponent } from './card/card-front/card-front.component';
import { CardBackComponent } from './card/card-back/card-back.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InfoComponent } from './info/info.component';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    OptionsComponent,
    HeaderComponent,
    CardFrontComponent,
    CardBackComponent,
    InfoComponent,
  ],
  imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
