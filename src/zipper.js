var daggy = require('daggy'),
    Option = require('fantasy-options'),
    Seq = require('./seq'),

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
    var lhs = this.x,
        rhs = this.y;
    if (rhs.x.length < 1) return Option.None;
    else return Option.of(
        Zipper(
            rhs.last().cata({
                Some: function(a) {
                    return Seq.of(a).concat(lhs);
                },
                None: function() {
                    return lhs;
                }
            }),
            rhs.init()
        )
    );
};
Zipper.prototype.forwards = function() {
    var lhs = this.x,
        rhs = this.y;
    if (lhs.x.length < 1) return Option.None;
    else return Option.of(
        Zipper(
            lhs.init(),
            lhs.last().cata({
                Some: function(a) {
                    return Seq.of(a).concat(rhs);
                },
                None: function() {
                    return lhs;
                }
            })
        )
    );
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