var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),
    Option = require('fantasy-options'),

    constant = combinators.constant,
    identity = combinators.identity,

    Tuple2 = tuples.Tuple2,
    Seq = daggy.taggedSum({
        Cons: ['cons'],
        Nil: []
    });

// Methods
Seq.of = function(x) {
    return Seq.Cons([x]);
};
Seq.empty = function() {
    return Seq.Nil;
};
Seq.prototype.chain = function(f) {
    return this.fold(
        Seq.Nil,
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
    return this.cata({
        Cons: function(x) {
            return rec(x, 0, v);
        },
        Nil: constant(v)
    });
};

// Derived
Seq.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};
Seq.prototype.concat = function(x) {
    return x.fold(this, function(a, b) {
        return a.cata({
            Cons: function(y) {
                return Seq.Cons(y.concat(b));
            },
            Nil: function() {
                return Seq.of(b);
            }
        });
    });
};
Seq.prototype.map = function(f) {
    return this.chain(function(x) {
        return Seq.of(f(x));
    });
};
Seq.prototype.reverse = function() {
    return this.cata({
        Cons: function(y) {
            return Seq.Cons(y.slice().reverse());
        },
        Nil: Seq.empty
    });
};

// Common
Seq.prototype.filter = function(f) {
    return this.cata({
        Cons: function(x) {
            var accum = [],
                i;
            for (i = 0; i < x.length; i++) {
                if (f(x[i])) accum.push(x[i]);
            }
            return Seq.Cons(accum);
        },
        Nil: Seq.empty
    });
};
Seq.prototype.first = function() {
    return this.cata({
        Cons: function(x) {
            return Option.of(x.slice(0, 1)[0]);
        },
        Nil: function() {
            return Option.None;
        }
    });
};
Seq.prototype.init = function() {
    return this.cata({
        Cons: function(x) {
            return Seq.Cons(x.slice(1));
        },
        Nil: Seq.empty
    });
};
Seq.prototype.last = function() {
    return this.cata({
        Cons: function(x) {
            return Option.of(x[x.length - 1]);
        },
        Nil: function() {
            return Option.None;
        }
    });
};
Seq.prototype.partition = function(f) {
    return this.cata({
        Cons: function(x) {
            var lhs = [],
                rhs = [],
                i;
            for (i = 0; i < x.length; i++) {
                if (f(x[i])) lhs.push(x[i]);
                else rhs.push(x[i]);
            }
            return Tuple2(Seq.Cons(lhs), Seq.Cons(rhs));
        },
        Nil: function() {
            return Tuple2(Seq.Nil, Seq.Nil);
        }
    });
};
Seq.prototype.take = function(x) {
    var env = this;
    return this.cata({
        Cons: function(x) {
            return Seq.Cons(x.slice(0, x));
        },
        Nil: constant(env)
    });
};
Seq.prototype.zip = function(x) {
    return this.cata({
        Cons: function(a) {
            return x.cata({
                Cons: function(b) {
                    var i = 0,
                        accum = [],
                        numOf = Math.min(a.length, b.length);
                    for (i = 0; i < numOf; i++) {
                        accum.push(Tuple2(a[i], b[i]));
                    }
                    return Seq.Cons(accum);
                },
                Nil: Seq.empty
            });
        },
        Nil: Seq.empty
    });
};

// IO
Seq.from = function(a, b) {
    var i = 0,
        accum = [];
    for (i = a; i < b; i++) {
        accum.push(i);
    }
    return Seq.fromArray(accum);
};
Seq.fromArray = function(a) {
    return a.length < 1 ? Seq.Nil : Seq.Cons(a);
};

// Transformer
Seq.SeqT = function(M) {
    var SeqT = daggy.tagged('run'),
        sequence = function(x) {
            return x.fold(M.of(Seq.empty()), function(a, b) {
                return a.chain(function(x) {
                    return b.chain(function(y) {
                        return M.of(x.concat(y));
                    });
                });
            });
        };
    SeqT.of = function(x) {
        return SeqT(M.of(Seq.of(x)));
    };
    SeqT.empty = function() {
        return SeqT(M.of(Seq.empty()));
    };
    SeqT.prototype.fold = function(a, b) {
        return this.run.chain(function(o) {
            return M.of(o.fold(a, b));
        });
    };
    SeqT.prototype.chain = function(f) {
        var m = this.run;
        return SeqT(m.chain(function(o) {
            return sequence(
                o.fold(Seq.empty(), function(a, b) {
                    return a.concat(Seq.of(f(b).run));
                })
            );
        }));
    };
    SeqT.prototype.concat = function(x) {
        return SeqT(sequence(
            Seq.of(this.run).concat(Seq.of(x.run))
        ));
    };
    SeqT.prototype.map = function(f) {
        return this.chain(function(a) {
            return SeqT.of(f(a));
        });
    };
    SeqT.prototype.ap = function(a) {
        return this.chain(function(f) {
            return a.map(f);
        });
    };
    return SeqT;
};

// Export
if(typeof module != 'undefined')
    module.exports = Seq;