import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {FlightOfferService} from './flight-offer.service';

describe('FlightOfferService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlightOfferService]
    });
  });

  it('WHEN calling FlightOfferService THEN http call is done with the right URL', inject([FlightOfferService, HttpTestingController], fakeAsync((fos, htc) => {
    let response;
    fos.getFlightOffers('NCE', 'AMS', '2020-01-01', 2).subscribe(res => {
      response = res;
    });
    const testRequest = htc.expectOne('http://localhost:8080/flights/NCE/AMS/2020-01-01/2');
    expect(testRequest.request.url).toEqual('http://localhost:8080/flights/NCE/AMS/2020-01-01/2');
    testRequest.flush([]);
    tick();
  })));

});
