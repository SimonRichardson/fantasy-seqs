var seqs = require('../../fantasy-seqs'),
    
    Seq = seqs.Seq,
    Zipper = seqs.Zipper;

function backwards(a) {
    return a.y.cata({
        Cons: function(x) {
            var left = Seq.Cons(x.slice(1)),
                right = Seq.Cons(x.slice(0, 1));
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function forwards(a) {
    return a.x.cata({
        Cons: function(x) {
            var left = Seq.Cons(x.slice(1)),
                right = Seq.Cons(x.slice(0, 1));
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

if (typeof module != 'undefined')
    module.exports = {
        backwards: backwards,
        forwards: forwards
    };
