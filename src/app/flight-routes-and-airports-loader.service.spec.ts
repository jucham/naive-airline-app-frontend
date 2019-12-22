import {FlightRoutesAndAirportsLoaderService} from './flight-routes-and-airports-loader.service';
import {of} from 'rxjs';

describe('FlightRoutesAndAirportsLoaderService', () => {

  let httpClientSpy;
  let loader;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    loader = new FlightRoutesAndAirportsLoaderService(httpClientSpy as any);
  });

  it('GIVEN airport data from backend API WHEN loading the airports THEN airports are well loaded', () => {

    // -- GIVEN --
    const airportsDataFromAPI = {
      '_embedded': {
        'airport': [
          {
            'name': 'Lester B. Pearson',
            'iata': 'YYZ'
          },
          {
            'name': 'Frankfurt am Main',
            'city': 'Frankfurt',
            'country': 'Germany',
            'iata': 'FRA',
            'icao': 'EDDF',
            'latitude': 50.033333,
            'longitude': 8.570556,
            'altitude': 364,
            'timezone': 1,
            'dst': 'E',
            'tzDatabaseTimeZone': 'Europe/Berlin',
            'type': 'airport',
            'source': 'OurAirports',
            '_links': {
              'self': {
                'href': 'http://localhost:8080/airport/340'
              },
              'airportEntity': {
                'href': 'http://localhost:8080/airport/340'
              }
            }
          }, {
            'name': 'Munich',
            'city': 'Munich',
            'country': 'Germany',
            'iata': 'MUC',
            'icao': 'EDDM',
            'latitude': 48.353802,
            'longitude': 11.7861,
            'altitude': 1487,
            'timezone': 1,
            'dst': 'E',
            'tzDatabaseTimeZone': 'Europe/Berlin',
            'type': 'airport',
            'source': 'OurAirports',
            '_links': {
              'self': {
                'href': 'http://localhost:8080/airport/346'
              },
              'airportEntity': {
                'href': 'http://localhost:8080/airport/346'
              }
            }
          }
        ]
      }
    };

    httpClientSpy.get.and.returnValue(of(airportsDataFromAPI));

    // -- WHEN --
    loader.loadAirports();

    // -- THEN --
    expect(loader.airports.length).toEqual(3);
    expect(loader.airports[0]).toEqual({code: 'YYZ', name: 'Lester B. Pearson'});
    expect(loader.airports[1]).toEqual({code: 'FRA', name: 'Frankfurt am Main'});
    expect(loader.airports[2]).toEqual({code: 'MUC', name: 'Munich'});

  });


  it('GIVEN route data from backend API WHEN loading the routes THEN routes are well loaded', () => {

    // -- GIVEN --
    const routeDataFromAPI = {
      '_embedded': {
        'route': [
          {iataSrc: 'NCE', iataDst: 'AMS'},
          {iataSrc: 'NCE', iataDst: 'ATL'},
          {iataSrc: 'NAP', iataDst: 'AMS'},
          {iataSrc: 'AMS', iataDst: 'NAP'},
          {iataSrc: 'AMS', iataDst: 'ATL'},
          {iataSrc: 'AMS', iataDst: 'NCE'}
        ]
      }
    };
    httpClientSpy.get.and.returnValue(of(routeDataFromAPI));

    // -- WHEN --
    loader.loadRoutes();

    // -- THEN --
    expect(loader.routeFrom).toEqual(
      new Map<string, string[]>(
        [
          ['NCE', ['AMS', 'ATL']],
          ['NAP', ['AMS']],
          ['AMS', ['NAP', 'ATL', 'NCE']]
        ])
    );
    expect(loader.routeTo).toEqual(
      new Map<string, string[]>(
        [
          ['AMS', ['NCE', 'NAP']],
          ['ATL', ['NCE', 'AMS']],
          ['NCE', ['AMS']],
          ['NAP', ['AMS']]
        ])
    );
  });
});
