var moment = require('moment');

if (process.env.NODE_ENV !== 'production' ) {
  [
    Array.prototype.some,
    Array.prototype.filter,
    Array.prototype.reduce
  ].forEach(method => {
    if ( !method ) throw new Error(
      'One or more ES5 features is not available to ReactWidgets: http://jquense.github.io/react-widgets/docs/#/getting-started/browser' )
  })
}

var ReactWidgets = {

  DropdownList:     require('./DropdownList'),
  Combobox:         require('./Combobox'),

  Calendar:         require('./Calendar'),
  DateTimePicker:   require('./DateTimePicker'),

  NumberPicker:     require('./NumberPicker'),
  
  Multiselect:      require('./Multiselect'),
  SelectList:       require('./SelectList'),

  configure:        require('./configure'),
  
  utils: {
    ReplaceTransitionGroup: require('./ReplaceTransitionGroup'),
    SlideTransition:        require('./SlideTransition')
  }
}

var localizer = require('./MomentLocalizer');

ReactWidgets.configure.setDateLocalizer(localizer(moment));

module.exports = ReactWidgets;