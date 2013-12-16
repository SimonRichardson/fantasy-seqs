var λ = require('./lib/test'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),

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

function run(a) {
    var concat = function(a, b) {
            return a.concat(b.toString());
        },
        show = function(a) {
            return '[' + a.fold([], concat).toString() + ']';
        };
    return Identity.of(show(a));
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
    )
};
