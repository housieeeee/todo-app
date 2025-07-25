import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    // 1. REMOVE AppComponent FROM HERE
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppComponent // 2. ADD AppComponent HERE
  ],
  providers: [],
  // 3. REMOVE bootstrap array since AppComponent is standalone
})
export class AppModule { }