'use strict';

var babelHelpers = require('./util/babelHelpers.js');

var React = require('react'),
    invariant = require('react/lib/invariant'),
    activeElement = require('react/lib/getActiveElement'),
    cx = require('classnames'),
    compat = require('./util/compat'),
    _ = require('./util/_') //pick, omit, has

,
    dates = require('./util/dates'),
    localizers = require('./util/configuration').locale,
    views = require('./util/constants').calendarViews,
    popups = require('./util/constants').datePopups,
    Popup = require('./Popup'),
    Calendar = require('./Calendar').BaseCalendar,
    Time = require('./TimeList'),
    DateInput = require('./DateInput'),
    Btn = require('./WidgetButton'),
    CustomPropTypes = require('./util/propTypes'),
    isDate = require('./util/dateHelper.js'),
    createUncontrolledWidget = require('uncontrollable');

var viewEnum = Object.keys(views).map(function (k) {
  return views[k];
});

var propTypes = babelHelpers._extends({}, compat.type(Calendar).propTypes, {

  //-- controlled props -----------
  value: React.PropTypes.oneOfType([React.PropTypes.instanceOf(Date), React.PropTypes.string]),
  onChange: React.PropTypes.func,
  open: React.PropTypes.oneOf([false, popups.TIME, popups.CALENDAR]),
  onToggle: React.PropTypes.func,
  //------------------------------------

  onSelect: React.PropTypes.func,

  min: React.PropTypes.instanceOf(Date),
  max: React.PropTypes.instanceOf(Date),

  culture: React.PropTypes.string,

  format: CustomPropTypes.dateFormat,
  timeFormat: CustomPropTypes.dateFormat,
  editFormat: CustomPropTypes.dateFormat,

  calendar: React.PropTypes.bool,
  time: React.PropTypes.bool,

  timeComponent: CustomPropTypes.elementType,

  //popup
  dropUp: React.PropTypes.bool,
  duration: React.PropTypes.number,

  placeholder: React.PropTypes.string,
  name: React.PropTypes.string,

  initialView: React.PropTypes.oneOf(viewEnum),
  finalView: React.PropTypes.oneOf(viewEnum),

  disabled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.oneOf(['disabled'])]),

  readOnly: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.oneOf(['readOnly'])]),

  parse: React.PropTypes.oneOfType([React.PropTypes.arrayOf(React.PropTypes.string), React.PropTypes.string, React.PropTypes.func]),
  errorClass: React.PropTypes.string.isRequired,
  hintClass: React.PropTypes.string.isRequired,
  empty: React.PropTypes.bool,

  id: React.PropTypes.string.isRequired,

  displayError: React.PropTypes.bool.isRequired,

  calendarButtonFocusedClass: React.PropTypes.string.isRequired,

  dateValidator: React.PropTypes.func.isRequired,

  inputValueStore: React.PropTypes.shape({
    value: React.PropTypes.string
  }).isRequired,

  messages: React.PropTypes.shape({
    calendarButton: React.PropTypes.string,
    timeButton: React.PropTypes.string }),
  calendarOnChange: React.PropTypes.func,
  onPopupEvent: React.PropTypes.func
});

var DateTimePicker = React.createClass({

  displayName: 'DateTimePicker',

  mixins: [require('./mixins/WidgetMixin'), require('./mixins/TimeoutMixin'), require('./mixins/PureRenderMixin'), require('./mixins/PopupScrollToMixin'), require('./mixins/RtlParentContextMixin')],

  propTypes: propTypes,

  getInitialState: function getInitialState() {
    return {
      focused: false,
      calendarButtonFocused: false
    };
  },

  getDefaultProps: function getDefaultProps() {

    return {
      value: null,

      min: new Date(1900, 0, 1),
      max: new Date(2099, 11, 31),
      calendar: true,
      time: true,
      open: false,

      //calendar override
      footer: true,

      messages: {
        calendarButton: 'Select Date',
        timeButton: 'Select Time' }
    };
  },

  onCalendarButtonFocus: function onCalendarButtonFocus(e) {
    this.setState({ calendarButtonFocused: true });
  },

  onCalendarButtonBlur: function onCalendarButtonBlur(e) {
    this.setState({ calendarButtonFocused: false });
  },

  render: function render() {
    var _cx;

    var _$omit = _.omit(this.props, Object.keys(propTypes));

    var className = _$omit.className;
    var props = babelHelpers.objectWithoutProperties(_$omit, ['className']);
    var calProps = _.pick(this.props, Object.keys(compat.type(Calendar).propTypes));

    var timeListID = this._id('_time_listbox');
    var timeOptID = this._id('_time_option');
    var dateListID = this._id('_cal');
    var dropUp = this.props.dropUp;
    var renderPopup = _.isFirstFocusedRender(this) || this.props.open
    // , value = dateOrNull(this.props.value)
    ;var dateInputValue = this.props.value;
    var value = this.props.value instanceof Date ? dateInputValue : new Date();
    var owns;

    if (dateListID && this.props.calendar) owns = dateListID;
    if (timeListID && this.props.time) owns += ' ' + timeListID;

    var spanClasses = 'rw-select' + (this.props.displayError ? ' ' + this.props.errorClass : '');

    if (this.props.calendarButtonFocusedClass && this.state.calendarButtonFocused) spanClasses += ' ' + this.props.calendarButtonFocusedClass;

    return React.createElement(
      'div',
      babelHelpers._extends({}, props, {
        ref: 'element',
        tabIndex: '-1',
        onKeyDown: this._maybeHandle(this._keyDown),
        onFocus: this._maybeHandle(this._focus.bind(null, true), true),
        onBlur: this._focus.bind(null, false),
        id: this.props.id,
        className: cx(className, 'rw-datetimepicker', 'rw-widget', this.props.displayError ? this.props.errorClass : '', (_cx = {}, _cx['rw-state-focus'] = this.state.focused, _cx['rw-state-disabled'] = this.isDisabled(), _cx['rw-state-readonly'] = this.isReadOnly(), _cx['rw-has-both'] = this.props.calendar && this.props.time, _cx['rw-has-neither'] = !this.props.calendar && !this.props.time, _cx['rw-rtl'] = this.isRtl(), _cx['rw-open' + (dropUp ? '-up' : '')] = this.props.open, _cx)) }),
      React.createElement(DateInput, { ref: 'valueInput',
        empty: this.props.empty,
        hintClass: this.props.hintClass,
        presenter: this.props.presenter,
        inputValueStore: this.props.inputValueStore,
        'aria-labelledby': this.props['aria-labelledby'],
        'aria-activedescendant': this.props.open ? this.props.open === popups.CALENDAR ? this._id('_cal_view_selected_item') : timeOptID : undefined,
        'aria-expanded': !!this.props.open,
        'aria-busy': !!this.props.busy,
        'aria-owns': owns,
        'aria-haspopup': true,
        placeholder: this.props.placeholder,
        name: this.props.name,
        disabled: this.isDisabled(),
        readOnly: this.isReadOnly(),
        role: this.props.time ? 'combobox' : null,
        value: value,
        dateValidator: this.props.dateValidator,
        format: getFormat(this.props),
        editFormat: this.props.editFormat,

        editing: this.state.focused,
        culture: this.props.culture,
        parse: this._parse,
        onChange: this._change }),
      (this.props.calendar || this.props.time) && React.createElement(
        'span',
        { className: spanClasses, focusedClass: this.props.calendarButtonFocusedClass },
        this.props.calendar && React.createElement(
          Btn,
          {
            onFocus: this.onCalendarButtonFocus,
            onBlur: this.onCalendarButtonBlur,
            className: 'rw-btn-calendar',
            disabled: this.isDisabled() || this.isReadOnly(),
            'aria-disabled': this.isDisabled() || this.isReadOnly(),
            onClick: this._maybeHandle(this._click.bind(null, popups.CALENDAR)) },
          React.createElement(
            'i',
            { className: 'rw-i rw-i-calendar' },
            React.createElement(
              'span',
              { className: 'rw-sr' },
              this.props.messages.calendarButton
            )
          )
        ),
        this.props.time && React.createElement(
          Btn,
          { tabIndex: '-1',
            className: 'rw-btn-time',
            disabled: this.isDisabled() || this.isReadOnly(),
            'aria-disabled': this.isDisabled() || this.isReadOnly(),
            onClick: this._maybeHandle(this._click.bind(null, popups.TIME)) },
          React.createElement(
            'i',
            { className: 'rw-i rw-i-clock-o' },
            React.createElement(
              'span',
              { className: 'rw-sr' },
              this.props.messages.timeButton
            )
          )
        )
      ),
      React.createElement(
        Popup,
        {
          className: 'rw-calendar-popup',
          dropUp: dropUp,
          open: this.props.open === popups.CALENDAR,
          duration: this.props.duration,
          onRequestClose: this.close },
        renderPopup && React.createElement(Calendar, babelHelpers._extends({}, calProps, {
          ref: 'calPopup',
          tabIndex: '-1',
          id: dateListID,
          value: value,
          'aria-hidden': !this.props.open,
          onChange: this._maybeHandle(this._selectDate) }))
      )
    );
  },

  _change: function _change(date, str, constrain) {
    if (this.props.presenter) this.props.presenter(date, str);
    var change = this.props.onChange;

    if (constrain) date = this.inRangeValue(date);

    if (change) {
      if (date == null || this.props.value == null) {
        if (date != this.props.value) change(date, str);
      } else {
        change(date, str);
      }
    }
  },

  _keyDown: function _keyDown(e) {

    if (e.key === 'Tab') return;

    if (e.key === 'Escape' && this.props.open) this.close();else if (e.altKey) {
      e.preventDefault();

      if (e.key === 'ArrowDown') this.open(this.props.open === popups.CALENDAR ? popups.TIME : popups.CALENDAR);else if (e.key === 'ArrowUp') this.close();
    } else if (this.props.open) {
      if (this.props.open === popups.CALENDAR) this.refs.calPopup._keyDown(e);
      if (this.props.open === popups.TIME) this.refs.timePopup._keyDown(e);
    }

    this.notify('onKeyDown', [e]);
  },

  _focus: function _focus(focused, e) {
    var _this = this;

    var calendarOpen = this.props.open === popups.CALENDAR;

    // #75: need to aggressively reclaim focus from the calendar otherwise
    // disabled header/footer buttons will drop focus completely from the widget
    if (focused) calendarOpen && this.refs.valueInput.focus();

    this.setTimeout('focus', function () {
      if (!focused) _this.close();

      if (focused !== _this.state.focused) {
        _this.notify(focused ? 'onFocus' : 'onBlur', e);
        _this.setState({ focused: focused });
      }
    });
  },

  focus: function focus() {
    if (activeElement() !== compat.findDOMNode(this.refs.valueInput)) this.refs.valueInput.focus();
  },

  _selectDate: function _selectDate(date) {
    var v = this.props.value;

    // if (!isDate(v)) //v henter forrige value, feiler uten new Date() på noen
    v = new Date();

    var format = getFormat(this.props),
        dateTime = dates.merge(date, v),
        dateStr = formatDate(date, format, this.props.culture);

    this.close();
    this.notify('onSelect', [dateTime, dateStr]);
    this._change(dateTime, dateStr, true);
    this.focus();
    if (this.props.calendarOnChange) {
      this.props.calendarOnChange();
    }
  },

  _selectTime: function _selectTime(datum) {
    var format = getFormat(this.props),
        dateTime = dates.merge(this.props.value, datum.date),
        dateStr = formatDate(datum.date, format, this.props.culture);

    this.close();
    this.notify('onSelect', [dateTime, dateStr]);
    this._change(dateTime, dateStr, true);
    this.focus();
  },

  _click: function _click(view, e) {
    this.focus();
    this.toggle(view, e);
  },

  _parse: function _parse(string) {
    var format = getFormat(this.props, true),
        editFormat = this.props.editFormat,
        parse = this.props.parse,
        formats = [];

    if (typeof parse === 'function') return parse(string, this.props.culture);

    if (typeof format === 'string') formats.push(format);

    if (typeof editFormat === 'string') formats.push(editFormat);

    if (parse) formats = formats.concat(this.props.parse);

    invariant(formats.length, 'React Widgets: there are no specified `parse` formats provided and the `format` prop is a function. ' + 'the DateTimePicker is unable to parse `%s` into a dateTime, ' + 'please provide either a parse function or Globalize.js compatible string for `format`', string);

    return formatsParser(formats, this.props.culture, string);
  },

  toggle: function toggle(view, e) {

    this.props.open ? this.props.open !== view ? this.open(view) : this.close(view) : this.open(view);
  },

  open: function open(view) {
    if (this.props.open !== view && this.props[view] === true) {
      if (this.props.onPopupEvent) this.props.onPopupEvent('open');
      this.notify('onToggle', view);
    }
  },

  close: function close() {
    if (this.props.open) {
      if (this.props.onPopupEvent) this.props.onPopupEvent('close');
      this.notify('onToggle', false);
    }
  },

  inRangeValue: function inRangeValue(value) {
    if (value == null) return value;

    return dates.max(dates.min(value, this.props.max), this.props.min);
  } });

module.exports = createUncontrolledWidget(DateTimePicker, { open: 'onToggle', value: 'onChange' });

module.exports.BaseDateTimePicker = DateTimePicker;

function getFormat(props) {
  var cal = props[popups.CALENDAR] != null ? props.calendar : true,
      time = props[popups.TIME] != null ? props.time : true;

  return props.format ? props.format : cal && time || !cal && !time ? localizers.date.formats['default'] : localizers.date.formats[cal ? 'date' : 'time'];
}

function formatDate(date, format, culture) {
  var val = '';

  if (date instanceof Date && !isNaN(date.getTime())) val = localizers.date.format(date, format, culture);

  return val;
}

function formatsParser(formats, culture, str) {
  var date;

  for (var i = 0; i < formats.length; i++) {
    date = localizers.date.parse(str, formats[i], culture);
    if (date) return date;
  }
  return null;
}

// function dateOrNull(dt){
//   if (dt && !isNaN(dt.getTime())) return dt
//   return null
// }