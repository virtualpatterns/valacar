'use strict';

console.log('--- ./library ------------------------------------------------------------------')
console.log(require.resolve('./errors/argument-error'));
console.log(require.resolve('./errors/migration-error'));
console.log(require.resolve('./errors/process-error'));
console.log(require.resolve('./errors/validation-error'));
console.log(require.resolve('./application'));
console.log(require.resolve('./database'));
console.log(require.resolve('./leases'));
console.log(require.resolve('./log'));
console.log(require.resolve('./migration'));
console.log(require.resolve('./path'));
console.log(require.resolve('./process'));
console.log(require.resolve('../package.json'));

require('./errors/libraries');
