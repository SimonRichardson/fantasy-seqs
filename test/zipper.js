var λ = require('./lib/test'),
    combinators = require('fantasy-combinators'),

    seqs = require('../fantasy-seqs'),
    Option = require('fantasy-options'),
    Identity = require('fantasy-identities'),

    constant = combinators.constant,

    Seq = seqs.Seq,
    Zipper = seqs.Zipper;

λ.goal = 10;

function expected(a, c, b) {
    return a.length < 1 || c > a.length ? Option.None : Option.of(b);
}

function chains(n, a, f) {
    return n < 1 ? a : chains(n - 1, a.chain(f), f);
}

function equals(a, b) {
    return a.cata({
        Some: function(zip0) {
            return b.cata({
                Some: function(zip1) {
                    return λ.equals(zip0.x, zip1.x) && λ.equals(zip0.y, zip1.y);
                },
                None: constant(false)
            });
        },
        None: function() {
            return b.cata({
                Some: constant(false),
                None: constant(true)
            });
        }
    });
}

function run(a) {
    var concat = function(a, b) {
            return a.concat(b.toString());
        },
        show = function(a) {
            return '[' + a.fold([], concat).toString() + ']';
        };
    return Identity.of(show(a.x) + show(a.y));
}

exports.zipper = {

    // Manual tests
    // Left & Right
    'testing zipper left should return correct value': λ.check(
        function(a) {
            var seq = Seq.fromArray(a),
                zipper = Zipper.of(seq);
            return equals(
                zipper.backwards(),
                Option.None
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right should return correct value': λ.check(
        function(a) {
            var seq = Seq.fromArray(a),
                zipper = Zipper.of(seq);
            return equals(
                zipper.forwards(),
                expected(a, 1, λ.forwards(Zipper.of(seq)))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    )
};
