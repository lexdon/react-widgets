'use strict';
var React = require('react')
  , cx = require('classnames')
  , dates = require('./util/dates')
  , compat = require('./util/compat')
  , localizers = require('./util/configuration').locale
  , CustomPropTypes = require('./util/propTypes');

module.exports = React.createClass({

  displayName: 'DatePickerInput',


  propTypes: {
    format:       CustomPropTypes.dateFormat.isRequired,
    editFormat:   CustomPropTypes.dateFormat,
    parse:        React.PropTypes.func.isRequired,

    value:        React.PropTypes.oneOfType([React.PropTypes.instanceOf(Date), React.PropTypes.string]),
    onChange:     React.PropTypes.func.isRequired,
    culture:      React.PropTypes.string,
    dateValidator: React.PropTypes.func.isRequired,
    inputValueStore:  React.PropTypes.shape({
      value: React.PropTypes.string
    }).isRequired,

  },

  getDefaultProps: function(){
    return {
      textValue: ''
    }
  },

  componentDidMount() {
    console.log(this.props.inputValueStore.value);
  },

  componentWillReceiveProps: function(nextProps) {
    this._setState(nextProps, (text) => {
      this.setState({
        textValue: text
      });
    });
  },

  getInitialState: function(){
    return this._setState(this.props, (text) => {
      return {
        textValue: text
      };
    });
  },

  _setState(props, cb) {
    if (props.value instanceof Date) {
      var text = formatDate(
        props.value,
        props.editing && props.editFormat 
          ? props.editFormat 
          : props.format, 
        props.culture,
        this.props.presenter);

      return cb(text);
    } else {
      return cb(props.value);
    }
  },

  render: function(){
    var value = this.state.textValue

    return (
      <input
        {...this.props}       
        ref="input"
        type='text'
        className={cx({'rw-input': true })}
        value={this.props.inputValueStore.value}
        aria-disabled={this.props.disabled}
        aria-readonly={this.props.readOnly}
        disabled={this.props.disabled}
        readOnly={this.props.readOnly}
        onChange={this._change}
        onBlur={chain(this.props.blur, this._blur, this)} />
    )
  },

  _change: function(e){
    this.setState({ textValue: e.target.value });
    this.props.inputValueStore.value = e.target.value;
    this._needsFlush = true
  },

  _blur: function(e){
    var val = e.target.value;

    var input = React.findDOMNode(this.refs['input']);

    if ( this._needsFlush ){
      this._needsFlush = false
      this.props.onChange(
        localizers.date.parse(val, this.props.format, this.props.culture, this.props.dateValidator, input), val);
    }
  },

  focus: function(){
    compat.findDOMNode(this).focus()
  }

});

function isValid(d) {
  return !isNaN(d.getTime());
}

function formatDate(date, format, culture, props){
  var val = ''

  if ( (date instanceof Date) && isValid(date) )
    val = localizers.date.format(date, format, culture, props ? props.presenter : undefined)

  return val;
}

function chain(a,b, thisArg){
  return function(){
    a && a.apply(thisArg, arguments)
    b && b.apply(thisArg, arguments)
  }
}