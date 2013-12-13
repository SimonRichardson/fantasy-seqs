var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),
    Option = require('fantasy-options'),

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
    // TODO (Simon) : Trampoline this!
    var rec = function(a, index, b) {
        if (index < a.length) {
            return rec(a, index + 1, f(b, a[index]));
        } else return b;
    };
    return rec(this.x, 0, v);
};

// Derived
Seq.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};
Seq.prototype.concat = function(x) {
    return Seq(this.x.concat(x.x));
};
Seq.prototype.map = function(f) {
    return this.chain(function(x) {
        return Seq.of(f(x));
    });
};

// Common
Seq.prototype.init = function() {
    if (this.x.length < 1) return Seq.empty();
    else return Seq(this.x.slice(1));
};
Seq.prototype.last = function() {
    var numOf = this.x.length;
    if (numOf < 1) return Option.None;
    else return Option.of(this.x[numOf - 1]);
};
Seq.prototype.first = function() {
    if (this.x.length < 1) return Option.None;
    else return Option.of(this.x.slice(0, 1));
};
Seq.prototype.zip = function(x) {
    var i = 0,
        accum = [],
        numOf = Math.min(this.x.length, x.x.length);
    if (numOf < 1) return Seq.empty();
    else {
        for (i = 0; i < numOf; i++) {
            accum.push(Tuple2(this.x[i], x.x[i]));
        }
        return Seq(accum);
    }
};

// IO
Seq.from = function(a, b) {
    return Seq.empty();
};
Seq.fromArray = function(a) {
    return Seq(a);
};

// Export
if(typeof module != 'undefined')
    module.exports = Seq;