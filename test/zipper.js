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
    )/*,
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
    ),
    'testing zipper right multiple times should return correct value': λ.check(
        function(a) {
            var seq = Seq.fromArray(a),
                zipper = Zipper.of(seq);
            return equals(
                chains(
                    2,
                    zipper.forwards(),
                    function(a) {
                        return a.forwards();
                    }
                ),
                expected(a, 3, λ.forwards(λ.forwards(λ.forwards(Zipper.of(seq)))))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'test': function(test) {
        var seq = Seq.fromArray([0, 1, 2, 3]);
        var zipper = Zipper.of(seq);
        console.log('\n--------');
        console.log(seq.concat(Seq.fromArray([4, 5, 6, 7])));
        console.log('\n--------');
        console.log(zipper);
        console.log(zipper.forwards().x);
        console.log(zipper.forwards().x.forwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x.forwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x.forwards().x.forwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x.forwards().x.backwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x.forwards().x.backwards().x.backwards().x);
        console.log(zipper.forwards().x.forwards().x.forwards().x.forwards().x.backwards().x.backwards().x.backwards().x);
        test.ok(true);
        test.done();
    }*/
};
