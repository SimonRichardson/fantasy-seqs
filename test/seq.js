var λ = require('./lib/test'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),
    semigroup = require('fantasy-check/src/laws/semigroup'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),
    seqs = require('../fantasy-seqs'),

    Identity = require('fantasy-identities'),
    Tuple2 = tuples.Tuple2,
    Seq = seqs.Seq,

    constant = combinators.constant,
    identity = combinators.identity,
    randomRange = helpers.randomRange;

function isEven(a) {
    return (a % 2) === 0;
}
function sum(a, b) {
    return a + b;
}

function run(a) {
    var concat = function(a, b) {
            return a.concat(b.toString());
        },
        show = function(a) {
            return '[' + a.fold([], concat).toString() + ']';
        };
    return Identity.of(show(a));
}
function runT(a) {
    return run(a.run.x);
}

exports.seq = {
    
    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Seq, run),
    'Identity (Applicative)': applicative.identity(λ)(Seq, run),
    'Composition (Applicative)': applicative.composition(λ)(Seq, run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Seq, run),
    'Interchange (Applicative)': applicative.interchange(λ)(Seq, run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Seq.of, run),
    'Identity (Functor)': functor.identity(λ)(Seq.of, run),
    'Composition (Functor)': functor.composition(λ)(Seq.of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Seq, run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Seq, run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Seq, run),
    'Associativity (Monad)': monad.associativity(λ)(Seq, run),

    // Monoid tests
    'All (Monoid)': monoid.laws(λ)(Seq, run),
    'leftIdentity (Monoid)': monoid.leftIdentity(λ)(Seq, run),
    'rightIdentity (Monoid)': monoid.rightIdentity(λ)(Seq, run),
    'associativity (Monoid)': monoid.associativity(λ)(Seq, run),

    // Semigroup tests
    'All (Semigroup)': semigroup.laws(λ)(Seq.of, run),
    'associativity (Semigroup)': semigroup.associativity(λ)(Seq.of, run),

    // Manual tests
    'when using concat should concat in correct order': λ.check(
        function(a, b) {
            var x = Seq.fromArray(a),
                y = Seq.fromArray(b);

            return λ.equals(x.concat(y), Seq.fromArray(a.concat(b)));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using take should take correct number': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                len = a.length,
                rnd = Math.floor(randomRange(0, len > 1 ? len : 0));
            return λ.equals(x.take(rnd), Seq.fromArray(a.slice(0, rnd)));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse should invert seq to correct order': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = a.slice().reverse();
            return λ.equals(x.reverse(), Seq.fromArray(y));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse after concat should invert seq to correct order': λ.check(
        function(a, b) {
            var x = Seq.fromArray(a),
                y = Seq.fromArray(b),
                z = a.concat(b).slice().reverse();

            return λ.equals(x.concat(y).reverse(), Seq.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse before concat should invert seq to correct order': λ.check(
        function(a, b) {
            var x = Seq.fromArray(a),
                y = Seq.fromArray(b),
                z = a.slice().reverse().concat(b);

            return λ.equals(x.reverse().concat(y), Seq.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),

    // Common
    'when testing filter should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.filter(isEven),
                z = λ.filter(a, isEven);
            return λ.equals(y, Seq.fromArray(z));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing first should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.first(),
                z = λ.first(a);
            return y.cata({
                Some: function(a) {
                    return z.cata({
                        Some: function(b) {
                            return a === b;
                        },
                        None: constant(false)
                    });
                },
                None: function() {
                    return z.cata({
                        Some: constant(false),
                        None: constant(true)
                    });
                }
            });
        },
        [λ.arrayOf(Number)]
    ),
    'when testing find should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.find(function(b) {
                    return a[0] === b;
                });
            return y.cata({
                Some: function(x) {
                    return x === a[0];
                },
                None: function() {
                    return a.length < 1;
                }
            });
        },
        [λ.arrayOf(Number)]
    ),
    'when testing init should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.init(),
                z = λ.init(a);
            return λ.equals(y, Seq.fromArray(z));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing last should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.last(),
                z = λ.last(a);
            return y.cata({
                Some: function(a) {
                    return z.cata({
                        Some: function(b) {
                            return a === b;
                        },
                        None: constant(false)
                    });
                },
                None: function() {
                    return z.cata({
                        Some: constant(false),
                        None: constant(true)
                    });
                }
            });
        },
        [λ.arrayOf(Number)]
    ),
    'when testing partition should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.partition(isEven),
                z = λ.partition(a, isEven);
            return λ.equals(y._1, Seq.fromArray(z._1)) &&
                    λ.equals(y._2, Seq.fromArray(z._2));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing reduce should return correct seq': λ.check(
        function(a) {
            var x = Seq.fromArray(a),
                y = x.reduce(sum),
                z = λ.reduce(a, sum);
            return y === z;
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing take should return correct seq': λ.check(
        function(a) {
            var rnd = randomRange(0, a.length),
                x = Seq.fromArray(a),
                y = x.take(rnd),
                z = a.slice(0, rnd);
            return λ.equals(y, Seq.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing zip should return correct seq': λ.check(
        function(a, b) {
            var x = Seq.fromArray(a),
                y = Seq.fromArray(b),
                z = x.zip(y),
                zz = λ.zip(a, b);
            return λ.equals(z, Seq.fromArray(zz), function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when testing toArray should return correct array': λ.check(
        function(a) {
            var x = Seq.fromArray(a);
            return λ.arrayEquals(x.toArray(), a);
        },
        [λ.arrayOf(λ.AnyVal)]
    )
};

exports.seqT = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Seq.SeqT(Identity), runT),
    'Identity (Applicative)': applicative.identity(λ)(Seq.SeqT(Identity), runT),
    'Composition (Applicative)': applicative.composition(λ)(Seq.SeqT(Identity), runT),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Seq.SeqT(Identity), runT),
    'Interchange (Applicative)': applicative.interchange(λ)(Seq.SeqT(Identity), runT),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Seq.SeqT(Identity).of, runT),
    'Identity (Functor)': functor.identity(λ)(Seq.SeqT(Identity).of, runT),
    'Composition (Functor)': functor.composition(λ)(Seq.SeqT(Identity).of, runT),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Seq.SeqT(Identity), runT),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Seq.SeqT(Identity), runT),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Seq.SeqT(Identity), runT),
    'Associativity (Monad)': monad.associativity(λ)(Seq.SeqT(Identity), runT),

    // Monoid tests
    'All (Monoid)': monoid.laws(λ)(Seq.SeqT(Identity), runT),
    'leftIdentity (Monoid)': monoid.leftIdentity(λ)(Seq.SeqT(Identity), runT),
    'rightIdentity (Monoid)': monoid.rightIdentity(λ)(Seq.SeqT(Identity), runT),
    'associativity (Monoid)': monoid.associativity(λ)(Seq.SeqT(Identity), runT),

    // Semigroup tests
    'All (Semigroup)': semigroup.laws(λ)(Seq.SeqT(Identity).of, runT),
    'associativity (Semigroup)': semigroup.associativity(λ)(Seq.SeqT(Identity).of, runT),

    // Manual tests
    'when testing reverse should return correct seqT': λ.check(
        function(a) {
            var SeqT = Seq.SeqT(Identity),
                x = SeqT.fromArray(a).reverse(),
                y = SeqT.fromArray(a.slice().reverse());
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing filter should return correct seqT': λ.check(
        function(a) {
            var SeqT = Seq.SeqT(Identity),
                x = SeqT.fromArray(a).filter(isEven),
                y = SeqT.fromSeq(Seq.fromArray(a).filter(isEven));
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing partition should return correct seqT': λ.check(
        function(a) {
            var SeqT = Seq.SeqT(Identity),
                x = SeqT.fromArray(a).partition(isEven),
                y = SeqT.fromSeq(Seq.fromArray(a).partition(isEven));
            return λ.equals(x.run.x._1, y.run.x._1, function(a) {
                    return function(b) {
                        return λ.arrayEquals(a, b);
                    };
                }) && λ.equals(x.run.x._2, y.run.x._2, function(a) {
                    return function(b) {
                        return λ.arrayEquals(a, b);
                    };
                });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing take should return correct seqT': λ.check(
        function(a) {
            var SeqT = Seq.SeqT(Identity),
                rnd = randomRange(0, a.length),
                x = SeqT.fromArray(a).take(rnd),
                y = SeqT.fromSeq(Seq.fromArray(a).take(rnd));
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing zip should return correct seqT': λ.check(
        function(a, b) {
            var SeqT = Seq.SeqT(Identity),
                x = SeqT.fromArray(a),
                y = SeqT.fromArray(b),
                z = x.zip(y),
                zz = SeqT.fromSeq(Seq.fromArray(a).zip(Seq.fromArray(b)));
            return λ.equals(z, zz, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    )
};
