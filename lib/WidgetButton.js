'use strict';

var babelHelpers = require('./util/babelHelpers.js');

var React = require('react');
var cn = require('classnames');
module.exports = React.createClass({
	displayName: 'exports',

	getInitialState: function getInitialState() {
		return {
			focused: false
		};
	},

	propTypes: {
		focusedClass: React.PropTypes.string
	},

	onFocus: function onFocus(e) {
		this.setState({ focused: true });
	},

	onBlur: function onBlur(e) {
		this.setState({ focused: false });
	},

	render: function render() {
		var _props = this.props;
		var className = _props.className;
		var children = _props.children;
		var props = babelHelpers.objectWithoutProperties(_props, ['className', 'children']);

		if (this.props.focusedClass && this.state.focused) className += ' ' + this.props.focusedClass;

		return React.createElement(
			'button',
			babelHelpers._extends({}, props, { type: 'button', className: cn(className, 'rw-btn'), onFocus: this.onFocus, onBlur: this.onBlur }),
			children
		);
	}
});