'use strict';
require('../src/less/react-widgets.less')

//require('react-a11y')();
var configure = require('../src/configure')

//configure.setGlobalizeInstance(window.Globalize);

var React = require('react/addons')
//var jquery = require('jquery')
var index = require('../src')
var DropdownList = require('./DropdownList.jsx')
var Multiselect = require('./Multiselect.jsx')
var Calendar = require('./Calendar.jsx')
var DateTimePicker = require('./DateTimePicker.jsx')
var NumberPicker = require('./NumberPicker.jsx')
var ComboBox = require('./Combobox.jsx')
var SelectList = require('./SelectList.jsx')
var List = require('./List.jsx')
var moment = require('moment');
var toInt = require('./util/to-int.js');
var invalidCharacterFound = require('./util/dateHelper.js');

var chance = new (require('chance'));
var states = require('./DateConstants.js');
var createUncontrolledWidget = require('uncontrollable');

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

var DatePicker = React.createClass({

  propTypes: {
    onChange: React.PropTypes.func,
    culture: React.PropTypes.string,
    defaultValue: React.PropTypes.instanceOf(Date),
    max: React.PropTypes.instanceOf(Date),
    min: React.PropTypes.instanceOf(Date),
    twoDigitYearFormats: React.PropTypes.shape({
      en: React.PropTypes.string,
      nb: React.PropTypes.string
    }),
    twoDigitYearBreakpoint: React.PropTypes.number,
    native: React.PropTypes.bool,
    calendarButtonFocusedClass: React.PropTypes.string,
    errorClass:React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    empty: React.PropTypes.bool  
  },

  getInitialState: function(){
    return {
      inputValueStore: {value: this.hintText()}, 
      comboboxValue: 1,
      selectValues: [3,4,5,2],
      calDate: new Date(),
      numberValue: 1,
      open: false,
      value: new Date()
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
      twoDigitYearBreakpoint: new Date().getFullYear() - 1995,
      native: false,
      calendarButtonFocusedClass: "focused",
      errorClass: "error",
      empty: false
    }
  },

  hintText() {
    var format = "";
    if (this.props.culture === 'en')
      format = "MM/DD/YY";
    else
      format = "DD.MM.YY"
    return format;
  },

  setHintText() {
    this.state.inputValueStore.value = this.hintText();
    this.setState({culture: this.state.culture});
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.empty)
      this.setHintText();
  },

  componentDidMount() {
    yearBreakpoint = this.props.twoDigitYearBreakpoint;
    if (this.props.empty)
      this.setHintText();
    else  
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

    var state = null;
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
          value: value
        });
        returnValue = value;
        break;
      case states.INVALID_DATE_FORMAT:
        this.setState({
          value: value
        });
        returnValue = value;
        break;
      case states.INVALID_FOUR_DIGIT_BEFORE_MIN:
        this.setState({
          value: value
        });
        break;
      case states.INVALID_FOUR_DIGIT_AFTER_MAX:
        this.setState({
          value: value
        });
        break;
      case states.INVALID_TWO_DIGIT_BEFORE_MIN:
        this.setState({
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = b.toDate() 
        break;
      case states.INVALID_TWO_DIGIT_AFTER_MAX:
        this.setState({
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = b.toDate() 
        break;
      case states.VALID_TWO_DIGIT_YEAR:
        this.setState({
          value: bToDate
        });
        this.state.inputValueStore.value = b.format(format);
        returnValue = bToDate 
        break;
      case states.VALID_FOUR_DIGIT_YEAR:
        this.setState({
          value: a.toDate()
        });
        this.state.inputValueStore.value = a.format(format);
        returnValue = a.toDate()
        break;
    }

    if (state !== null)
      this.onChange(value,state);
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

  onChange(value, state) {
    if(this.props.onChange) {
      this.props.onChange(value,state);
    }
  },

  onFocus() {
    yearBreakpoint = this.props.twoDigitYearBreakpoint;
  },

  render(){

    return (
      <div>
        {this.props.native ? 
          <input type="date" defaultValue={moment().format('YYYY-MM-DD')}/>
          :
          <DateTimePicker 
          empty={this.props.empty}
          hintClass={this.props.hintClass}
          onFocus={this.onFocus} 
          inputValueStore={this.state.inputValueStore} 
          presenter={this.presenter} 
          dateValidator={this.dateValidator} 
          value={this.state.value} 
          calendarButtonFocusedClass={this.props.calendarButtonFocusedClass} 
          errorClass={this.props.errorClass} 
          displayError={false} 
          id={this.props.id}
          culture={this.props.culture} 
          time={false} 
          max={this.props.max} 
          min={this.props.min} 
          onChange={this.onChange} />}
      </div>
    )
  },


})

//module.exports = createUncontrolledWidget(DatePicker, { open: 'onToggle', value: 'onChange' });
module.exports = DatePicker;

