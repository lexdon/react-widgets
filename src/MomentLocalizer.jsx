'use strict';

var moment = require('moment');

module.exports = function(moment){
  if (typeof moment !== 'function')
    throw new TypeError('You must provide a valid moment object')

  var localField = typeof moment().locale === 'function' ? 'locale' : 'lang'
    , hasLocaleData = !!moment.localeData;

  if ( !hasLocaleData )
    throw new TypeError(
      'The Moment localizer depends on the `localeData` api, please provide a moment object v2.2.0 or higher')

  function endOfDecade(date) {
    console.error("DERP")
    return moment(date).add(10, 'year').add(-1, 'millisecond').toDate()
  }

  function endOfCentury(date) {
    console.error("DERP")

    return moment(date).add(100, 'year').add(-1, 'millisecond').toDate()
  }

  return {
    formats: {
      date: 'L',
      time: 'LT',
      default: 'lll',
      header: 'MMMM YYYY',
      footer: 'LL',
      weekday(day, culture) {
    console.error("DERP")

        return moment()[localField](culture).weekday(day).format('dd')
      },

      dayOfMonth: 'DD',
      month: 'MMM',
      year: 'YYYY',

      decade(date, culture, localizer) {
    console.error("DERP")

        return localizer.format(date, 'YYYY', culture)
          + ' - ' + localizer.format(endOfDecade(date), 'YYYY', culture)
      },

      century(date, culture, localizer) {
    console.error("DERP")

        return localizer.format(date, 'YYYY', culture)
          + ' - ' + localizer.format(endOfCentury(date), 'YYYY', culture)
      }
    },

    firstOfWeek(culture) {
    console.error("DERP")

      return moment.localeData(culture).firstDayOfWeek()
    },

    parse(value, format, culture) {
      moment.locale("grønnsak");
      var result = moment(value).toDate();
      return moment(value).toDate();
    },

    format(value, format, culture) {
    console.error("DERP")

      return moment(value)[localField](culture).format(format)
    }
  }
}