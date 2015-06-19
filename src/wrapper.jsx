'use strict';
require('../src/less/react-widgets.less')

//require('react-a11y')();
var configure = require('../src/configure')

//configure.setGlobalizeInstance(window.Globalize);

var React = require('react/addons')
//var jquery = require('jquery')
var index = require('../src')
var DropdownList = require('../src/DropdownList.jsx')
var Multiselect = require('../src/Multiselect.jsx')
var Calendar = require('../src/Calendar.jsx')
var DatePicker = require('../src/DateTimePicker.jsx')
var NumberPicker = require('../src/NumberPicker.jsx')
var ComboBox = require('../src/Combobox.jsx')
var SelectList = require('../src/SelectList.jsx')
var List = require('../src/List.jsx')
var moment = require('moment');
var toInt = require('../src/util/to-int.js');
var invalidCharacterFound = require('../src/util/dateHelper.js');

var chance = new (require('chance'))

var { ModalTrigger, Modal } = require('react-bootstrap')
var yearBreakpoint;
moment.parseTwoDigitYear = function (input) {
  if(input < yearBreakpoint) {
    return toInt(input) + 2000;
  }
  return toInt(input) + 1900;
};

var endOfDecade = date => moment(date).add(10, 'year').add(-1, 'millisecond').toDate()
var endOfCentury = date => moment(date).add(100, 'year').add(-1, 'millisecond').toDate()

var localizer = {
  formats: {
    date: 'L',
    time: 'LT',
    default: 'lll',
    header: 'MMMM YYYY',
    footer: 'LL',
    weekday: (day, culture, localizer) => moment().locale(culture).weekday(day).format('dd'),

    dayOfMonth: 'DD',
    month: 'MMM',
    year: 'YYYY',

    decade: (date, culture, localizer) => {
      return localizer.format(date, 'YYYY', culture)
        + ' - ' + localizer.format(endOfDecade(date), 'YYYY', culture)
    },

    century: (date, culture, localizer) => {
      return localizer.format(date, 'YYYY', culture)
        + ' - ' + localizer.format(endOfCentury(date), 'YYYY', culture)
    }
  },

  firstOfWeek(culture){
    return moment.localeData(culture).firstDayOfWeek()
  },

  parse(value, format, culture, dateValidator, inputField){
    moment.locale(culture)

    return dateValidator(moment, value, format, inputField);
  },

  format(value, format, culture, presenter){
    moment.locale(culture)
    var a = moment(value);
    var formattedDate = a.format(format);
    if (presenter)
      presenter(a.toDate(), formattedDate);
    return formattedDate;
  }
}

configure.setDateLocalizer(localizer);


// configure.setAnimate((element, props, duration, ease, callback) => {
//   return jquery(element).animate(props, duration, callback)
// })

module.exports = React.createClass({

  getInitialState: function(){
    return {
      inputValueStore: {value: 'derp'}, 

      comboboxValue: 1,
      selectValues: [3,4,5,2],
      calDate: new Date(),
      numberValue: 1,
      open: false,
      something: "Sad",
      value: new Date(),

    }
  },

  getDefaultProps() {
    return {
      culture: 'nb',
      defaultValue: new Date(),
      max: new Date(3000, 1, 1),
      min: new Date(1000, 1, 1),
      twoDigitYearFormats: {
        en: "MM/DD/YY",
        nb: "DD.MM.YY"
      },
      twoDigitYearBreakpoint: 20
      // min={moment().subtract(3, 'years').toDate()
    }
  },

  componentDidMount() {
    yearBreakpoint = this.props.twoDigitYearBreakpoint;
    this.presenter(this.props.defaultValue);
  },

  dateValidator(moment, value, format, inputField) {
    var alternateFormat;

    if (this.props.culture === 'en')
      alternateFormat = "MM/DD/YY";
    else
      alternateFormat = "DD.MM.YY"

    var a = moment(value, format, true);
    var b = moment(value, alternateFormat, true);
    var bToDate = b.toDate();

    var states = {
      INVALID_DATE_FORMAT_CONTAINS_INVALID_CHARACTER: "INVALID_DATE_FORMAT_CONTAINS_INVALID_CHARACTER",
      INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
      INVALID_TWO_DIGIT_BEFORE_MIN: "INVALID_TWO_DIGIT_BEFORE_MIN",
      INVALID_TWO_DIGIT_AFTER_MAX: "INVALID_TWO_DIGIT_AFTER_MAX",
      INVALID_FOUR_DIGIT_BEFORE_MIN: "INVALID_FOUR_DIGIT_BEFORE_MIN",
      INVALID_FOUR_DIGIT_AFTER_MAX: "INVALID_FOUR_DIGIT_AFTER_MAX",
      VALID_TWO_DIGIT_YEAR: "VALID_TWO_DIGIT_YEAR",
      VALID_FOUR_DIGIT_YEAR: "VALID_FOUR_DIGIT_YEAR"
    }

    var state;
    var returnValue;

    //Validation and errormessages
    if (invalidCharacterFound(value)) {
      state = states.INVALID_DATE_FORMAT_CONTAINS_INVALID_CHARACTER;
    }else if (a.isValid()) {
      var dateIsBefore = a.isBefore(new Date());
      var minDate = moment().subtract(3, 'years').toDate();
      var dateIsAfter = a.isAfter(minDate);
      if(!dateIsBefore) {
        state = states.INVALID_FOUR_DIGIT_AFTER_MAX;
      }
      else if(!dateIsAfter) {
        state = states.INVALID_FOUR_DIGIT_BEFORE_MIN;
      }
      else
        state = states.VALID_FOUR_DIGIT_YEAR;
    } else if (b.isValid()) {
      var dateIsBefore = moment(bToDate).isBefore(new Date());
      var minDate = moment().subtract(3, 'years').toDate();
      var dateIsAfter = moment(bToDate).isAfter(minDate);
      if(!dateIsBefore) {
        state = states.INVALID_TWO_DIGIT_AFTER_MAX;
      }
      else if(!dateIsAfter) {
        state = states.INVALID_TWO_DIGIT_BEFORE_MIN;
      }
      else
        state = states.VALID_TWO_DIGIT_YEAR;
    } else {
      state = states.INVALID_DATE_FORMAT;
    }

    switch(state) {
      case states.INVALID_DATE_FORMAT_CONTAINS_INVALID_CHARACTER:
        this.setState({
          something: "Contains invalid character :(", 
          value: value
        });
        returnValue = value;
        break;
      case states.INVALID_DATE_FORMAT:
        this.setState({
          something: "Not valid :(", 
          value: value
        });
        returnValue = value;
        break;
      case states.INVALID_FOUR_DIGIT_BEFORE_MIN:
        this.setState({
          something: "Date is before something :(", 
          value: value
        });
        break;
      case states.INVALID_FOUR_DIGIT_AFTER_MAX:
        this.setState({
          something: "Date is after today: (", 
          value: value
        });
        break;
      case states.INVALID_TWO_DIGIT_BEFORE_MIN:
        this.setState({
          something: "Date is before something :(", 
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = b.toDate() 
        break;
      case states.INVALID_TWO_DIGIT_AFTER_MAX:
        this.setState({
          something: "Date is after today: (", 
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = b.toDate() 
        break;
      case states.VALID_TWO_DIGIT_YEAR:
        this.setState({
          something: "DD.MM.YY", 
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = bToDate 
        break;
      case states.VALID_FOUR_DIGIT_YEAR:
        this.setState({
          something: "DD.MM.YYYY",
          value: a.toDate()
        });
        this.state.inputValueStore.value = a.format(format);
        returnValue = a.toDate()
        break;
    }
    return returnValue;
  },

  presenter(date, formattedDate) {
    if (date instanceof Date) {
      moment.locale(this.props.culture);
      formattedDate = moment(date).format(localizer.formats.date); 
    }
    this.setState({value: date})
    this.state.inputValueStore.value = formattedDate;
  },

  componentDidUpdate(){
    if (this.start){
      // console.log('rendered: ', +(new Date()) - this.start)
      this.start = null
    }
  },

  onChange(date, str) {
    // console.log(date);
    // console.log(str);
  },

  render(){

    return (
      <div>
        <h1>{this.state.something}</h1>
        <DatePicker inputValueStore={this.state.inputValueStore} presenter={this.presenter} dateValidator={this.dateValidator} value={this.state.value} calendarButtonFocusedClass="hocus-pocus" errorClass="error" displayError={false} id="test" culture={this.props.culture} time={false} max={this.props.max} min={this.props.min} onChange={this.onChange} />
      </div>
    )
  },


})

