var Is = require('@pwn/is');

if (!Is.function(Object.assign)) {

  Object.assign = function(target) {

    if (!target) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);

    for (var index = 1; index < arguments.length; index++) {

      var source = arguments[index];

      if (source) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key))
            target[key] = source[key];
        }
      }

    }

    return target;

  };
  
}
