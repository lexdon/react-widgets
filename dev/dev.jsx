var React = require('react/addons')
var DatePicker = require('../src/DatePicker.jsx')
var states = require('../src/DateConstants.js')

var App = React.createClass({

	getInitialState() {
		return {
			something: "Something",
      empty: true
		}
	},

	onChange(value, state) {
		switch(state) {
      case states.INVALID_DATE_FORMAT_CONTAINS_INVALID_CHARACTER:
        this.setState({
          something: "Contains invalid character :(", 
        });
        break;
      case states.INVALID_DATE_FORMAT:
        this.setState({
          something: "Not valid :(", 
        });
        break;
      case states.INVALID_FOUR_DIGIT_BEFORE_MIN:
        this.setState({
          something: "Date is before something :(", 
        });
        break;
      case states.INVALID_FOUR_DIGIT_AFTER_MAX:
        this.setState({
          something: "Date is after today: (", 
        });
        break;
      case states.INVALID_TWO_DIGIT_BEFORE_MIN:
        this.setState({
          something: "Date is before something :(", 
        });
        break;
      case states.INVALID_TWO_DIGIT_AFTER_MAX:
        this.setState({
          something: "Date is after today: (", 
        });
        break;
      case states.VALID_TWO_DIGIT_YEAR:
        this.setState({
          something: "DD.MM.YY", 
        });
        break;
      case states.VALID_FOUR_DIGIT_YEAR:
        this.setState({
          something: "DD.MM.YYYY",
        });
        break;
    }
	},

  onClick() {
    this.setState({empty: !this.state.empty});
    this.refs['chosenOne'].setHintText();
  },

	render() {
		return (
			<div>
				<h1>{this.state.something}</h1>
        <button onClick={this.onClick}>Click me!</button>
    		<DatePicker id="test1" twoDigitYearBreakpoint={30} hintClass="hint" ref="chosenOne" empty={this.state.empty} onChange={this.onChange}/>
    		<DatePicker id="test2" twoDigitYearBreakpoint={50} hintClass="lint" onChange={this.onChange}/>
    		<DatePicker id="test3" twoDigitYearBreakpoint={70} hintClass="stint"/>
    		<DatePicker id="test4" twoDigitYearBreakpoint={90} hintClass="mint" />

    	</div>
		)
	},

})

React.render(<App/>, document.body);

module.exports = App;