var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    Option = require('fantasy-options'),
    Seq = require('./seq'),

    constant = combinators.constant,

    Zipper = daggy.tagged('x', 'y');

// Methods
Zipper.of = function(x) {
    return Zipper(x, Seq.empty());
};
Zipper.empty = function() {
    return Zipper(Seq.empty(), Seq.empty());
};

// Derived
Zipper.prototype.concat = function(a) {
    return Zipper(this.x.concat(a.x), this.y.concat(a.y));
};

// Common
Zipper.prototype.backwards = function() {
    var scope = this;
    return scope.y.cata({
        Cons: function(a) {
            return Option.of(
                Zipper(
                    scope.x.concat(Seq.Cons(a.slice(-1))),
                    Seq.Cons(a.slice(0, a.length - 1))
                )
            );
        },
        Nil: constant(Option.None)
    });
};
Zipper.prototype.forwards = function() {
    var scope = this;
    return scope.x.cata({
        Cons: function(a) {
            return Option.of(
                Zipper(
                    Seq.Cons(a.slice(0, a.length - 1)),
                    scope.y.concat(Seq.Cons(a.slice(-1)))
                )
            );
        },
        Nil: constant(Option.None)
    });
};
Zipper.prototype.first = function() {
    return this.backwards().chain(function(x) {
        return x.first();
    }).orElse(Option.of(this));
};
Zipper.prototype.last = function() {
    return this.forwards().chain(function(x) {
        return x.last();
    }).orElse(Option.of(this));
};

// IO
Zipper.fromSeq = Zipper.of;
Zipper.prototype.toSeq = function() {
    return this.x.concat(this.y);
};

// Export
if(typeof module != 'undefined')
    module.exports = Zipper;