import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class FlightOfferService {

  constructor(private httpClient: HttpClient) {

  }

  getFlightOffers(origin: string, destination: string, departureDate: string, numberOfPassengers: number): Observable<object> {
    return this.httpClient.get(`${environment.backendApiUrl}/flights/${origin}/${destination}/${departureDate}/${numberOfPassengers}`);
  }


}
