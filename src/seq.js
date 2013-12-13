var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),

    constant = combinators.constant,
    identity = combinators.identity,

    Tuple2 = tuples.Tuple2,
    Seq = daggy.tagged('x');

// Methods
Seq.of = function(x) {
    return Seq([x]);
};
Seq.empty = function() {
    return Seq([]);
};
Seq.prototype.chain = function(f) {
    return this.fold(
        Seq.empty(),
        function(a, b) {
            return a.concat(f(b));
        }
    );
};
Seq.prototype.fold = function(v, f) {

};

// IO
Seq.from = function(a, b) {
    return Seq.empty();
};
Seq.fromArray = function(a) {
    return Seq.of(a);
};

// Export
if(typeof module != 'undefined')
    module.exports = Seq;