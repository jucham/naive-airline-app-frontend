import {ProviderFlightOffer} from './provider-flight-offer.model';
import * as moment from 'moment';

export class FlightOffer {

  departure: string;
  departureCode: string;
  departureDate: string;
  arrival: string;
  arrivalCode: string;
  arrivalDate: string;
  duration: number;
  totalPrice: number;
  flightNumber: number;
  aircraftType: string;
  remainingSeats: number;

  constructor(providerFlightOffer: ProviderFlightOffer, numberOfPassengers: number, airportByCode: Map<string, string>) {
    this.flightNumber = providerFlightOffer.flightNumber;
    this.departureCode = providerFlightOffer.originAirportCode;
    this.departure = airportByCode.get(this.departureCode);
    this.arrivalCode = providerFlightOffer.destinationAirportCode;
    this.arrival = airportByCode.get(this.arrivalCode);
    const departureMoment = moment(providerFlightOffer.startDate);
    const arrivalMoment = moment(departureMoment).add(providerFlightOffer.duration, 'minutes');
    const dateFormat = FlightOffer.getFormatOfDate(departureMoment, arrivalMoment);
    this.departureDate = departureMoment.format(dateFormat);
    this.arrivalDate = arrivalMoment.format(dateFormat);
    this.duration = providerFlightOffer.duration;
    this.aircraftType = providerFlightOffer.aircraftType;
    this.totalPrice = providerFlightOffer.pricePerPassenger * numberOfPassengers;
    this.remainingSeats = providerFlightOffer.remainingSeats;
  }

  static getFormatOfDate(departureMoment, arrivalMoment): string {
    const dateFormat = 'YYYY/MM/DD';
    const timeFormat = 'HH:mm';
    if (departureMoment.isSame(arrivalMoment, 'day')) {
      return timeFormat;
    }
    return dateFormat + ' ' + timeFormat;
  }

}
