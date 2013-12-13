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
    'associativity (Monoid)': monoid.associativity(λ)(Seq, run)

    // Manual tests
};
