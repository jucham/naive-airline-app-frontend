import * as moment from 'moment';

export function getDateAsYYYYMMDD(date: Date): string {
  return moment(date).format('YYYY-MM-DD');
}
