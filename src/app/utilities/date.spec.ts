import {getDateAsYYYYMMDD} from './date';


describe('Date utility', () => {

  it('should format the date correctly', () => {
    expect(getDateAsYYYYMMDD(new Date(2020, 0, 1))).toEqual('2020-01-01');
  });
});

