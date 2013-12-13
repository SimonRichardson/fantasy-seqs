var λ = require('fantasy-check/src/adapters/nodeunit'),
    equals = require('./equality'),
    zipper = require('./zipper');

function extend(a, b) {
    var rec = function(a, b) {
        var i;
        for(i in b) {
            a = a.property(i, b[i]);
        }
        return a;
    };
    return rec(a, b);
}

λ = extend(
        λ,
        zipper
    )
    .property('equals', equals);

if (typeof module != 'undefined')
    module.exports = λ;