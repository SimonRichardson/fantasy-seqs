var Seq = require('./src/seq'),
    Zipper = require('./src/zipper');

if (typeof module != 'undefined')
    module.exports = {
        Seq: Seq,
        Zipper: Zipper
    };