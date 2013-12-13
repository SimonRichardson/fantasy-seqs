var daggy = require('daggy'),

    Zipper = daggy.tagged('x', 'y');

// Export
if(typeof module != 'undefined')
    module.exports = Zipper;