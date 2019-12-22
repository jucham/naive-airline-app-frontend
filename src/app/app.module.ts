import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SearchFlightComponent} from './search-flight/search-flight.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule, MatGridListModule,
  MatInputModule,
  MatNativeDateModule, MatProgressSpinnerModule,
  MatSidenavModule
} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlightRoutesAndAirportsLoaderService} from './flight-routes-and-airports-loader.service';
import {RouterModule, Routes} from '@angular/router';
import {SearchFlightFormComponent} from './search-flight-form/search-flight-form.component';
import {SearchFlightOffersComponent} from './search-flight-offers/search-flight-offers.component';
import {AboutComponent} from './about/about.component';
import {APP_BASE_HREF, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {FlightOfferService} from './flight-offer.service';
import {ProgressSpinnerModule} from './progress-spinner/progress-spinner.module';


const routes: Routes = [
  // basic routes
  {path: '', redirectTo: 'search', pathMatch: 'full'},
  {path: 'search', component: SearchFlightComponent},
  {path: 'about', component: AboutComponent}
];

export function stopoverProviderFactory(provider: FlightRoutesAndAirportsLoaderService) {
  return () => provider.load();
}

@NgModule({
  declarations: [
    AppComponent,
    SearchFlightComponent,
    SearchFlightFormComponent,
    SearchFlightOffersComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSidenavModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    RouterModule.forRoot(routes),
    ProgressSpinnerModule
  ],
  providers: [FlightRoutesAndAirportsLoaderService, {
    provide: APP_INITIALIZER,
    useFactory: stopoverProviderFactory,
    deps: [FlightRoutesAndAirportsLoaderService],
    multi: true
  },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: APP_BASE_HREF, useValue: '/'},
  FlightOfferService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
