import {Airport} from './search-flight-form/search-flight-form.component';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';

@Injectable()
export class FlightRoutesAndAirportsLoaderService {

  airports: Airport[] = [];
  airportByCode = new Map<string, string>();

  /**
   * `routeFrom` are routes whose the key is the departure airport and values
   * are arrival airports reachable from this departure airport.
   */
  routeFrom: Map<string, string[]> = new Map<string, string[]>();

  /**
   * `routeTo` are routes whose the key is the arrival airport and values are
   * departure airports from which we can go to this arrival airport.
   */
  routeTo: Map<string, string[]> = new Map<string, string[]>();

  constructor(private http: HttpClient) {
  }

  load() {
    this.loadAirports();
    this.loadRoutes();
  }

  private loadRoutes() {
    this.http
      .get(`${environment.backendApiUrl}/route`)
      .subscribe(response => {
        const rawRoutes: any[] = response['_embedded']['route'];
        for (const rawRoute of rawRoutes) {
          const airport = rawRoute['iataSrc'];
          const reachableAirport = rawRoute['iataDst'];
          this.updateRoutes(this.routeFrom, airport, reachableAirport);
          this.updateRoutes(this.routeTo, reachableAirport, airport);
        }

      });
  }

  private updateRoutes(routes: Map<string, string[]>, airport: string, reachableAirport: string) {
    const reachableAirports = routes.get(airport);
    if (reachableAirports) {
      reachableAirports.push(reachableAirport);
      routes.set(airport, reachableAirports);
    } else {
      routes.set(airport, [reachableAirport]);
    }
  }

  private loadAirports() {
    this.http.get(`${environment.backendApiUrl}/airport`)
      .subscribe(response => {
        const rawAirports: any[] = response['_embedded']['airport'];
        for (const rawAirport of rawAirports) {
          const code = rawAirport['iata'];
          const name = rawAirport['name'];
          const airport = {code, name};
          this.airports.push(airport);
          this.airportByCode.set(code, name);
        }
      });
  }
}
