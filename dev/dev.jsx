var React = require('react/addons')
var DatePicker = require('../src/DatePicker.jsx')
var states = require('../src/constants/DateConstants.js')

var App = React.createClass({

	getInitialState() {
		return {
			something: "Something"
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

	render() {
		return (
			<div>
				<h1>{this.state.something}</h1>
    		<DatePicker id="test1" twoDigitYearBreakpoint={30} onChange={this.onChange}/>
    		<DatePicker id="test2" twoDigitYearBreakpoint={50} onChange={this.onChange}/>
    		<DatePicker id="test3" twoDigitYearBreakpoint={70}/>
    		<DatePicker id="test4" twoDigitYearBreakpoint={90}/>

    	</div>
		)
	},

})

React.render(<App/>, document.body);

module.exports = App;