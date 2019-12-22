import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {FlightOffer} from './flight-offer.model';

@Component({
  selector: 'app-search-flight-offers',
  templateUrl: './search-flight-offers.component.html',
  styleUrls: ['./search-flight-offers.component.css']
})
export class SearchFlightOffersComponent implements OnInit {

  @HostBinding('attr.class') cssClass = 'row';
  @Input() flightOffer: FlightOffer;

  constructor() {
  }

  ngOnInit() {
  }

}
