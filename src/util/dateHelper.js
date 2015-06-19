module.exports = value => {
  if (value instanceof Date) {
    return true;
  }
  var tokens = value.split('');

  var nonNumericCharacterFound = false;

  for (var i = 0; i < tokens.length; i++) {
    var e = tokens[i];
    if (isNaN(parseInt(e)) && !(e === '.' || e === '/' || e === '-')){
      nonNumericCharacterFound = true;
      break;
    }
  };

  return nonNumericCharacterFound;
};