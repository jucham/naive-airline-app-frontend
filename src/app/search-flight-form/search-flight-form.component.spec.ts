import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Airport, SearchFlightFormComponent} from './search-flight-form.component';
import {FlightOfferService} from '../flight-offer.service';
import {anything, instance, mock, verify, when} from 'ts-mockito';
import {of, throwError} from 'rxjs';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlightRoutesAndAirportsLoaderService} from '../flight-routes-and-airports-loader.service';
import {FlightOffer} from '../search-flight-offers/flight-offer.model';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ProviderFlightOffer} from '../search-flight-offers/provider-flight-offer.model';
import {skip, throttleTime} from 'rxjs/operators';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {ProgressSpinnerModule} from '../progress-spinner/progress-spinner.module';
import {getDateAsYYYYMMDD} from '../utilities/date';
import {HttpErrorResponse} from '@angular/common/http';

describe('SearchFlightFormComponent', () => {

  let fixture: ComponentFixture<SearchFlightFormComponent>;
  let component: SearchFlightFormComponent;
  let flightOfferService: FlightOfferService;

  beforeEach(() => {
    flightOfferService = mock(FlightOfferService);
  });

  afterEach(() => {
    fixture.destroy();
  });

  const AMSTERDAM = {code: 'AMS', name: 'Amsterdam'};
  const ATLANTA = {code: 'ATL', name: 'Atlanta'};
  const NAPLES = {code: 'NAP', name: 'Naples'};
  const NICE = {code: 'NCE', name: 'Nice'};

  function configureTest() {
    const flightRouteAndAirportLoaderService = {
      airportByCode: new Map<string, string>([['AMS', 'Amsterdam'], ['ATL', 'Atlanta'], ['NAP', 'Naples'], ['NCE', 'Nice']]),
      airports: [
        AMSTERDAM,
        ATLANTA,
        NAPLES,
        NICE
      ],
      routeFrom: new Map<string, string[]>(
        [
          ['NCE', ['AMS', 'ATL']],
          ['NAP', ['AMS']],
          ['AMS', ['NAP', 'ATL', 'NCE']]
        ]),

      routeTo: new Map<string, string[]>(
        [
          ['AMS', ['NCE', 'NAP']],
          ['ATL', ['AMS', 'NCE']],
          ['NCE', ['AMS']],
          ['NAP', ['AMS']]
        ])
    };

    TestBed.configureTestingModule({
      declarations: [SearchFlightFormComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatGridListModule,
        ProgressSpinnerModule
      ],
      // provide the component-under-test and dependent service
      providers: [
        SearchFlightFormComponent,
        {provide: FlightOfferService, useValue: instance(flightOfferService)},
        {provide: FlightRoutesAndAirportsLoaderService, useValue: flightRouteAndAirportLoaderService},

      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFlightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillFormWithValidInputs() {
    component.departureControl.setValue(NICE);
    component.arrivalControl.setValue(AMSTERDAM);
    component.departureDateControl.setValue('2020-01-01');
    component.numberOfPassengersControl.setValue(2);
  }

  function focusedElement(debugElement: DebugElement) {
    return debugElement.query(By.css(':focus')).nativeElement;
  }

  it('WHEN departure input is empty THEN departure input is invalid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.departureControl.setValue('something');
    fixture.detectChanges();
    component.departureControl.setValue('', {emitEvent: true});
    fixture.detectChanges();

    // -- THEN --
    expect(component.departureControl.invalid).toBe(true);
  });

  it('WHEN departure input is valid THEN departure input interpreted as valid', () => {

    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.departureControl.setValue(NICE);

    // -- THEN --
    expect(component.departureControl.invalid).toBe(false);
  });

  it('WHEN arrival input is empty THEN arrival is invalid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.arrivalControl.setValue('');

    // -- THEN --
    expect(component.arrivalControl.invalid).toBe(true);
  });

  it('WHEN arrival input is valid THEN arrival input interpreted as valid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.arrivalControl.setValue(NICE);

    // -- THEN --
    expect(component.arrivalControl.invalid).toBe(false);
  });

  it('WHEN departure date is missing THEN departure date interpreted as invalid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.departureDateControl.setValue('');

    // -- THEN --
    expect(component.departureDateControl.invalid).toBe(true);
  });

  it('WHEN date departure is wrong THEN departure date is interpreted as invalid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.departureDateControl.setValue('2020-03-2');

    // -- THEN --
    expect(component.departureDateControl.invalid).toBe(true);
  });

  it('WHEN departure date is valid THEN departure date is interpreted as valid', () => {
    // -- GIVEN --
    configureTest();

    // -- WHEN --
    component.departureDateControl.setValue('2020-03-05');

    // -- THEN --
    expect(component.departureDateControl.invalid).toBe(false);
  });

  it('GIVEN some input is invalid WHEN hit search button THEN first invalid input is focused AND backend API is never called', () => {
    // -- GIVEN --
    configureTest();
    const debugElement = fixture.debugElement;
    when(flightOfferService.getFlightOffers(anything(), anything(), anything(), anything())).thenReturn(of([]));
    fillFormWithValidInputs();
    component.arrivalControl.setValue('');
    component.numberOfPassengersControl.setValue('');
    const arrivalInput = debugElement.query(By.css('#arrivalInput')).nativeElement;
    const numberOfPassengersInput = debugElement.query(By.css('#numberOfPassengersInput')).nativeElement;
    const numberOfPassengersInputFocusMethod = spyOn(numberOfPassengersInput, 'focus').and.callThrough();
    const arrivalInputFocusMethod = spyOn(arrivalInput, 'focus').and.callThrough();

    // -- GIVEN --
    // arrival is empty
    // -- WHEN --
    component.onSearchButtonClicked();
    // -- THEN --
    expect(focusedElement(debugElement)).toBe(arrivalInput);
    expect(arrivalInputFocusMethod).toHaveBeenCalledTimes(1);

    // -- GIVEN --
    // arrival is still empty
    // -- WHEN --
    component.onSearchButtonClicked();
    // -- THEN --
    expect(focusedElement(debugElement)).toBe(arrivalInput);
    expect(arrivalInputFocusMethod).toHaveBeenCalledTimes(2);

    // -- GIVEN --
    // invalid arrival date is set
    component.arrivalControl.setValue('2020-0123');
    // -- WHEN --
    component.onSearchButtonClicked();
    // -- THEN --
    expect(focusedElement(debugElement)).toBe(arrivalInput);
    expect(arrivalInputFocusMethod).toHaveBeenCalledTimes(3);

    // -- GIVEN --
    // correct arrival is set and number of passengers is still invalid
    component.arrivalControl.setValue(AMSTERDAM);
    // -- WHEN --
    component.onSearchButtonClicked();
    // -- THEN --
    expect(focusedElement(debugElement)).toBe(numberOfPassengersInput);
    expect(numberOfPassengersInputFocusMethod).toHaveBeenCalledTimes(1);

    // -- GIVEN --
    // an invalid number of passengers is set
    component.numberOfPassengersControl.setValue(SearchFlightFormComponent.MAX_NUMBER_OF_PASSENGERS + 1);
    // -- WHEN --
    component.onSearchButtonClicked();
    // -- THEN --
    expect(focusedElement(debugElement)).toBe(numberOfPassengersInput);
    expect(numberOfPassengersInputFocusMethod).toHaveBeenCalledTimes(2);

    // -- THEN --
    // no backend API call should have been done
    verify(flightOfferService.getFlightOffers(anything(), anything(), anything(), anything())).never();
  });

  it('WHEN departure input is set with "n" THEN departure options are Atlanta, Naples and Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.departureAirports$ = component.departureAirports$.pipe(skip(1));
    component.departureAirports$.subscribe(assert());

    // -- WHEN --
    component.departureControl.setValue('n');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(3);
        expect(airports[0]).toEqual(ATLANTA);
        expect(airports[1]).toEqual(NAPLES);
        expect(airports[2]).toEqual(NICE);
      };
    }
  });

  it('WHEN departure input is set with "ni" THEN departure options is Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.departureAirports$ = component.departureAirports$.pipe(skip(1));
    component.departureAirports$.subscribe(assert());

    // -- WHEN --
    component.departureControl.setValue('ni');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(1);
        expect(airports[0]).toEqual(NICE);
      };
    }
  });

  it('WHEN arrival input is set with "n" THEN arrival options are Atlanta, Naples and Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.arrivalAirports$ = component.arrivalAirports$.pipe(skip(1));
    component.arrivalAirports$.subscribe(assert());

    // -- WHEN --
    component.arrivalControl.setValue('n');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(3);
        expect(airports[0]).toEqual(ATLANTA);
        expect(airports[1]).toEqual(NAPLES);
        expect(airports[2]).toEqual(NICE);
      };
    }
  });

  it('WHEN arrival input is set with "ni" THEN arrival options is Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.arrivalAirports$ = component.arrivalAirports$.pipe(skip(1));
    component.arrivalAirports$.subscribe(assert());

    // -- WHEN --
    component.arrivalControl.setValue('ni');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(1);
        expect(airports[0]).toEqual(NICE);
      };
    }
  });

  it('WHEN Nice is chosen as departure THEN arrival options are Amsterdam and Atlanta', () => {

    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.arrivalAirports$ = component.arrivalAirports$.pipe(skip(1));
    component.arrivalAirports$.subscribe(assert());

    // -- WHEN --
    component.departureControl.setValue(NICE);
    component.formElementRefs.get(SearchFlightFormComponent.ARRIVAL).nativeElement.focus();

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(2);
        expect(airports[0]).toEqual(AMSTERDAM);
        expect(airports[1]).toEqual(ATLANTA);
      };
    }

  });

  it('WHEN departure is Nice AND arrival input is "am" THEN arrival options is Amsterdam', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.arrivalAirports$ = component.arrivalAirports$.pipe(skip(1));
    component.arrivalAirports$.subscribe(assert());

    // -- WHEN --
    component.departureControl.setValue(NICE);
    component.arrivalControl.setValue('am');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(1);
        expect(airports[0]).toEqual(AMSTERDAM);
      };
    }

  });

  it('WHEN arrival is Amsterdam THEN departure options are Naples and Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.departureAirports$ = component.departureAirports$.pipe(skip(1));
    component.departureAirports$.subscribe(assert());

    // -- WHEN --
    component.arrivalControl.setValue(AMSTERDAM);
    fixture.detectChanges();
    // component.formElementRefs.get(SearchFlightFormComponent.DEPARTURE).nativeElement.focus();
    component.onDepartureFocus();
    fixture.detectChanges();

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(2);
        expect(airports[0]).toEqual(NAPLES);
        expect(airports[1]).toEqual(NICE);
      };
    }
  });

  it('WHEN arrival is Amsterdam AND departure input is "n" THEN departure option is Naples and Nice', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.departureAirports$ = component.departureAirports$.pipe(skip(1));
    component.departureAirports$.subscribe(assert());

    // -- WHEN --
    component.arrivalControl.setValue(AMSTERDAM);
    component.departureControl.setValue('n');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(2);
        expect(airports[0]).toEqual(NAPLES);
        expect(airports[1]).toEqual(NICE);
      };
    }
  });

  it('WHEN arrival is Amsterdam AND departure input is "na" THEN departure option is Naples only', () => {
    // -- GIVEN --
    configureTest();
    // skip full airport list event emitted when component is rendered
    component.departureAirports$ = component.departureAirports$.pipe(skip(1));
    component.departureAirports$.subscribe(assert());

    // -- WHEN --
    component.arrivalControl.setValue(AMSTERDAM);
    component.departureControl.setValue('na');

    // -- THEN --
    function assert() {
      return (airports: Airport[]) => {
        expect(airports.length).toEqual(1);
        expect(airports[0]).toEqual(NAPLES);
      };
    }
  });

  it('GIVEN backend API provides 3 flight offers WHEN click search button THEN 3 flight offers are emitted AND have the right values ', () => {

    // -- GIVEN --

    // service input sent to backend API
    const origin = NICE;
    const destination = AMSTERDAM;
    const departureDate = new Date(2020, 0, 1);
    const numberOfPassengers = 4;

    // service output from backend  API
    const providerFlightOffers: ProviderFlightOffer[] = [
        {
          flightNumber: 1234,
          originAirportCode: 'NCE',
          destinationAirportCode: 'AMS',
          startDate: new Date(2020, 1, 1, 5),
          duration: 90,
          aircraftType: 'A320',
          pricePerPassenger: 125,
          remainingSeats: 33
        },

        {
          flightNumber: 5678,
          originAirportCode: 'NCE',
          destinationAirportCode: 'AMS',
          startDate: new Date(2020, 1, 1, 16, 30),
          duration: 80,
          aircraftType: 'A350',
          pricePerPassenger: 180,
          remainingSeats: 40
        }
      ]
    ;

    when(flightOfferService.getFlightOffers(origin.code, destination.code, getDateAsYYYYMMDD(departureDate), numberOfPassengers))
      .thenReturn(of(providerFlightOffers));

    configureTest();

    const formGroup = component['myFormGroup'];
    formGroup.controls.departure.setValue(NICE);
    formGroup.controls.arrival.setValue(AMSTERDAM);
    formGroup.controls.departureDate.setValue('2020-01-01');
    formGroup.controls.numberOfPassengers.setValue(4);

    component.results.subscribe(assert());

    // -- WHEN --
    component.onSearchButtonClicked();

    // -- THEN --
    function assert() {
      return (flightOffers: FlightOffer[]) => {
        const expectedFlightOffers: FlightOffer[] = [
          {
            flightNumber: 1234,
            departureCode: 'NCE',
            departure: 'Nice',
            arrivalCode: 'AMS',
            arrival: 'Amsterdam',
            departureDate: '05:00',
            arrivalDate: '06:30',
            duration: 90,
            aircraftType: 'A320',
            totalPrice: 500,
            remainingSeats: 33
          },
          {
            flightNumber: 5678,
            departureCode: 'NCE',
            departure: 'Nice',
            arrivalCode: 'AMS',
            arrival: 'Amsterdam',
            departureDate: '16:30',
            arrivalDate: '17:50',
            duration: 80,
            aircraftType: 'A350',
            totalPrice: 720,
            remainingSeats: 40
          }
        ];

        expect(JSON.stringify(expectedFlightOffers)).toEqual(JSON.stringify(flightOffers));

        // check total prices
        for (let i = 0; i < expectedFlightOffers.length; i++) {
          expect(expectedFlightOffers[i].totalPrice).toEqual(providerFlightOffers[i].pricePerPassenger * numberOfPassengers);
        }
      };
    }
  });

  it('GIVEN backend API is broken WHEN click search button THEN search results are an empty array', () => {

    // -- GIVEN --

    // service input sent to backend API
    const origin = NICE;
    const destination = AMSTERDAM;
    const departureDate = new Date(2020, 0, 1);
    const numberOfPassengers = 4;

    // service output from backend  API
    const responseInError = {'error': 'internal_error', 'errorDescription': 'Internal error from server'};

    when(flightOfferService.getFlightOffers(origin.code, destination.code, getDateAsYYYYMMDD(departureDate), numberOfPassengers))
      .thenReturn(throwError(responseInError));

    configureTest();

    const formGroup = component['myFormGroup'];
    formGroup.controls.departure.setValue(NICE);
    formGroup.controls.arrival.setValue(AMSTERDAM);
    formGroup.controls.departureDate.setValue('2020-01-01');
    formGroup.controls.numberOfPassengers.setValue(4);

    component.results.subscribe(assert());

    // -- WHEN --
    component.onSearchButtonClicked();

    // -- THEN --
    function assert() {
      return (flightOffers: FlightOffer[]) => {
        expect([]).toEqual(flightOffers);
      };
    }
  });

});
