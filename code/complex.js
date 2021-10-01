var Complex = /** @class */ (function () {
    function Complex(real, imag) {
        if (imag === void 0) { imag = 0; }
        this.real = real;
        this.imag = imag;
    }
    Complex.of = function (a) {
        return typeof a === 'number' ? new Complex(a) : a;
    };
    Complex.prototype.conj = function () {
        return new Complex(this.real, -this.imag);
    };
    Complex.prototype.abs = function () {
        return Math.hypot(this.real, this.imag);
    };
    Complex.prototype.neg = function () {
        return this.mul(-1);
    };
    Complex.prototype.exp = function () {
        return Complex.i.mul(Math.sin(this.imag))
            .add(Math.cos(this.imag))
            .mul(Math.exp(this.real));
    };
    // n is non-negative integer
    Complex.prototype.pow = function (n) {
        var ret = new Complex(1);
        var base = this;
        var mask = 1 << Math.floor(Math.log2(n));
        while (mask) {
            ret = Complex.mul(ret, ret);
            if (n & mask)
                ret = Complex.mul(ret, base);
            mask >>= 1;
        }
        return ret;
    };
    Complex.prototype.add = function (a) {
        return Complex.add(this, a);
    };
    Complex.prototype.sub = function (a) {
        return Complex.sub(this, a);
    };
    Complex.prototype.mul = function (a) {
        if (typeof a === 'number')
            return new Complex(this.real * a, this.imag * a);
        return Complex.mul(this, a);
    };
    Complex.prototype.div = function (a) {
        if (typeof a === 'number')
            return new Complex(this.real / a, this.imag / a);
        return Complex.div(this, a);
    };
    Complex.add = function (a, b) {
        a = Complex.of(a);
        b = Complex.of(b);
        return new Complex(a.real + b.real, a.imag + b.imag);
    };
    Complex.sub = function (a, b) {
        a = Complex.of(a);
        b = Complex.of(b);
        return new Complex(a.real - b.real, a.imag - b.imag);
    };
    Complex.mul = function (a, b) {
        return new Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
    };
    Complex.div = function (a, b) {
        return a.mul(b.conj()).mul(1 / b.abs());
    };
    Complex.i = new Complex(0, 1);
    return Complex;
}());
if (typeof module !== 'undefined')
  module.exports = Complex
