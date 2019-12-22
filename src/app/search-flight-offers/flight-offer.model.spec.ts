import {FlightOffer} from './flight-offer.model';
import * as moment from 'moment';

describe('FlightOffer', () => {

  it('GIVEN two dates the same day WHEN getting date format THEN date format is time only', () => {
    const dateFormat = FlightOffer.getFormatOfDate(moment(new Date(2020, 0, 15, 10)), moment(new Date(2020, 0, 15, 12)));
    expect(dateFormat).toEqual('HH:mm');
  });

  it('GIVEN two dates with consecutive days WHEN getting date format THEN date format is date and time', () => {
    const dateFormat = FlightOffer.getFormatOfDate(moment(new Date(2020, 0, 1, 23)), moment(new Date(2020, 0, 2, 1)));
    expect(dateFormat).toEqual('YYYY/MM/DD HH:mm');
  });

  it('GIVEN two dates with consecutive days with first date at midnight WHEN getting date format THEN date format is time only', () => {
    const dateFormat = FlightOffer.getFormatOfDate(moment(new Date(2020, 0, 1, 0)), moment(new Date(2020, 0, 1, 2)));
    expect(dateFormat).toEqual('HH:mm');
  });

  it('GIVEN two dates with consecutive days with second date at midnight WHEN getting date format THEN date format is date and time', () => {
    const dateFormat = FlightOffer.getFormatOfDate(moment(new Date(2020, 0, 1, 23)), moment(new Date(2020, 0, 2, 0)));
    expect(dateFormat).toEqual('YYYY/MM/DD HH:mm');
  });

  it('GIVEN two dates with the same day but different month WHEN getting date format THEN date format is date and time', () => {
    const dateFormat = FlightOffer.getFormatOfDate(moment(new Date(2020, 0, 15)), moment(new Date(2020, 1, 15)));
    expect(dateFormat).toEqual('YYYY/MM/DD HH:mm');
  });


});
