import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FlightRoutesAndAirportsLoaderService} from '../flight-routes-and-airports-loader.service';
import * as moment from 'moment';
import {FlightOffer} from '../search-flight-offers/flight-offer.model';
import {ProviderFlightOffer} from '../search-flight-offers/provider-flight-offer.model';
import {FlightOfferService} from '../flight-offer.service';
import {Overlay} from '@angular/cdk/overlay';
import {getDateAsYYYYMMDD} from '../utilities/date';


function airportValidator(control: FormControl): { [s: string]: boolean } {
  if (control.value == null || typeof control.value.code === 'undefined' || typeof control.value.name === 'undefined') {
    return {invalidAirport: true};
  }
}

export function departureDateValidator(control: FormControl): { [s: string]: boolean } {
  if (control.value == null || !moment(control.value, 'YYYY-MM-DD', true).isValid()) {
    return {invalidDepartureDate: true};
  }
}

function numberOfPassengersValidator(control: FormControl): { [s: string]: boolean } {
  if (control.value < SearchFlightFormComponent.MIN_NUMBER_OF_PASSENGERS) {
    return {noPassengerAtAll: true};
  } else {
    if (control.value > SearchFlightFormComponent.MAX_NUMBER_OF_PASSENGERS) {
      return {tooMuchPassengers: true};
    }
  }
}

export interface Airport {
  code: string;
  name: string;
}

export interface Route {
  src: string;
  dst: string[];
}

@Component({
  selector: 'app-search-flight-form',
  templateUrl: './search-flight-form.component.html',
  styleUrls: ['./search-flight-form.component.css']
})
export class SearchFlightFormComponent implements OnInit, AfterViewInit {

  public static readonly MIN_NUMBER_OF_PASSENGERS = 1;
  public static readonly MAX_NUMBER_OF_PASSENGERS = 10;

  public static readonly DEPARTURE = 'departure';
  public static readonly ARRIVAL = 'arrival';
  public static readonly DEPARTURE_DATE = 'departureDate';
  public static readonly NUMBER_OF_PASSENGERS = 'numberOfPassengers';

  @Output() results: EventEmitter<FlightOffer[]> = new EventEmitter<FlightOffer[]>();

  waitingSearchResults = false;
  private myFormGroup: FormGroup;

  departureControl: AbstractControl;
  arrivalControl: AbstractControl;
  departureDateControl: AbstractControl;
  numberOfPassengersControl: AbstractControl;

  airports: Airport[];
  airportByCode: Map<string, string>;

  departureAirports$: Observable<Airport[]>;
  arrivalAirports$: Observable<Airport[]>;
  minDate: Date = new Date();
  maxDate: Date = new Date(this.minDate.getFullYear() + 1, this.minDate.getMonth(), this.minDate.getDay());

  @ViewChild(SearchFlightFormComponent.DEPARTURE, {static: false}) departureField: ElementRef;
  @ViewChild(SearchFlightFormComponent.ARRIVAL, {static: false}) arrivalField: ElementRef;
  @ViewChild(SearchFlightFormComponent.DEPARTURE_DATE, {static: false}) departureDateField: ElementRef;
  @ViewChild(SearchFlightFormComponent.NUMBER_OF_PASSENGERS, {static: false}) numberOfPassengerField: ElementRef;

  formElementRefs: Map<string, ElementRef>;

  constructor(fb: FormBuilder, private flightRoutesAndAirportsLoaderService: FlightRoutesAndAirportsLoaderService, private flightOfferService: FlightOfferService, private overlay: Overlay) {
    this.initForm(fb);
    this.initAirportsAndRoutes();
  }

  private initForm(fb: FormBuilder) {
    this.myFormGroup = fb.group({
      [SearchFlightFormComponent.DEPARTURE]: ['', Validators.compose([Validators.required, airportValidator])],
      [SearchFlightFormComponent.ARRIVAL]: ['', Validators.compose([Validators.required, airportValidator])],
      [SearchFlightFormComponent.DEPARTURE_DATE]: ['', Validators.compose([Validators.required, departureDateValidator])],
      [SearchFlightFormComponent.NUMBER_OF_PASSENGERS]: ['', Validators.compose([Validators.required, numberOfPassengersValidator])]
    });
    this.departureControl = this.myFormGroup.controls.departure;
    this.arrivalControl = this.myFormGroup.controls.arrival;
    this.departureDateControl = this.myFormGroup.controls.departureDate;
    this.numberOfPassengersControl = this.myFormGroup.controls.numberOfPassengers;
  }

  private initAirportsAndRoutes() {
    this.airports = this.flightRoutesAndAirportsLoaderService.airports;
    this.airportByCode = this.flightRoutesAndAirportsLoaderService.airportByCode;
  }

  ngOnInit(): void {

    this.departureAirports$ = this.departureControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.getFilteredAirport(name) : this.airports.slice()),
        map(airports => {
          if (this.arrivalControl.value === null || this.arrivalControl.value.length === 0) {
            return airports;
          }
          return this.getFilteredDepartureAirportsFromAlreadyChosenArrival(airports);
        })
      );

    this.arrivalAirports$ = this.arrivalControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.getFilteredAirport(name) : this.airports.slice()),
        map(airports => {
          if (this.departureControl.value === null || this.departureControl.value.length === 0) {
            return airports;
          }
          return this.getFilteredArrivalAirportsFromAlreadyChosenDeparture(airports);
        })
      );

  }

  private getFilteredDepartureAirportsFromAlreadyChosenArrival(airports) {
    return airports.filter(airport => this.flightRoutesAndAirportsLoaderService.routeTo.get(this.arrivalControl.value.code).includes(airport.code));
  }

  private getFilteredArrivalAirportsFromAlreadyChosenDeparture(airports) {
    return airports.filter(airport => this.flightRoutesAndAirportsLoaderService.routeFrom.get(this.departureControl.value.code).includes(airport.code));
  }

  ngAfterViewInit() {
    this.formElementRefs = new Map<string, ElementRef>();
    this.formElementRefs.set(SearchFlightFormComponent.DEPARTURE, this.departureField);
    this.formElementRefs.set(SearchFlightFormComponent.ARRIVAL, this.arrivalField);
    this.formElementRefs.set(SearchFlightFormComponent.DEPARTURE_DATE, this.departureDateField);
    this.formElementRefs.set(SearchFlightFormComponent.NUMBER_OF_PASSENGERS, this.numberOfPassengerField);
  }

  displayAirport(airport?: Airport): string | undefined {
    return airport ? airport.name : undefined;
  }

  private getFilteredAirport(airportName: string): Airport[] {
    return this.airports.filter(airport => airport.name.toLowerCase().includes(airportName.toLowerCase())).slice(0, 10);
  }

  onSearchButtonClicked(): void {

    if (!this.myFormGroup.valid) {
      this.focusOnFirstFieldInError();
      return;
    }

    this.waitingSearchResults = true;
    this.callFlightAvailabilityAPI();
  }

  private focusOnFirstFieldInError() {
    const key = Object.keys(this.myFormGroup.controls).find(k => this.myFormGroup.controls[k].invalid);
    this.formElementRefs.get(key).nativeElement.focus();
  }

  private callFlightAvailabilityAPI() {
    const origin = this.departureControl.value.code;
    const destination = this.arrivalControl.value.code;
    const departureDate = getDateAsYYYYMMDD(this.departureDateControl.value);
    const numberOfPassengers = this.numberOfPassengersControl.value;
    this.flightOfferService.getFlightOffers(origin, destination, departureDate, numberOfPassengers)
      .subscribe(this.onFlightOffersReceived(), this.onError());
  }

  private onFlightOffersReceived() {
    return (data: ProviderFlightOffer[]) => {
      this.waitingSearchResults = false;
      const results = this.buildFlightOffers(data);
      this.results.emit(results);
    };
  }

  private onError() {
   return () => {
     this.waitingSearchResults = false;
     this.results.emit([]);
   };
  }

  private buildFlightOffers(data: ProviderFlightOffer[]) {
    const results: FlightOffer[] = [];
    for (const offer of data) {
      results.push(new FlightOffer(offer, this.numberOfPassengersControl.value, this.airportByCode));
    }
    return results;
  }

  onDepartureFocus() {
    this.departureControl.updateValueAndValidity();
  }

  onArrivalFocus() {
    this.arrivalControl.updateValueAndValidity();
  }



}
