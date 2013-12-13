var seqs = require('../../fantasy-seqs'),
    
    Seq = seqs.Seq,
    Zipper = seqs.Zipper;

function backwards(a) {
    throw new Error('???');
}

function forwards(a) {
    var lhs = a.x,
        rhs = a.y;

    if (lhs.x.length < 1) return Zipper.empty();
    else return Zipper(
        lhs.init(),
        lhs.last().cata({
            Some: Seq.of,
            None: Seq.empty
        })
    );
}

if (typeof module != 'undefined')
    module.exports = {
        backwards: backwards,
        forwards: forwards
    };
