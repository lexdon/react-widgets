'use strict';
var React = require('react');
var cn = require('classnames');
module.exports = React.createClass({
	getInitialState() {
		return {
			focused: false
		}
	},

	propTypes: {
		focusedClass: React.PropTypes.string
	},

	onFocus(e) {
		this.setState({focused: true});
	},

	onBlur(e) {
		this.setState({focused: false});
	},

  render: function(){
    var { className, children, ...props} = this.props;
    if (this.props.focusedClass && this.state.focused)
    	className += ' ' + this.props.focusedClass;

    return (
      <button {...props} type='button' className={cn(className, 'rw-btn')} onFocus={this.onFocus} onBlur={this.onBlur}>
        { children }
      </button>
    )
  }
})