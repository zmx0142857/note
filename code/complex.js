class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }
    static of(a) {
        return typeof a === 'number' ? new Complex(a) : a;
    }
    copy() {
        return new Complex(this.real, this.imag);
    }
    conj() {
        return new Complex(this.real, -this.imag);
    }
    abs() {
        return Math.hypot(this.real, this.imag);
    }
    neg() {
        return this.mul(-1);
    }
    exp() {
        return Complex.i.mul(Math.sin(this.imag))
            .add(Math.cos(this.imag))
            .mul(Math.exp(this.real));
    }
    // n is non-negative integer
    pow(n) {
        let ret = new Complex(1);
        let base = this.copy();
        while (n) {
            if (n & 1)
                ret = ret.mul(base);
            base = base.mul(base);
            n >>= 1;
        }
        return ret;
    }
    add(a) {
        return Complex.add(this, a);
    }
    sub(a) {
        return Complex.sub(this, a);
    }
    mul(a) {
        if (typeof a === 'number')
            return new Complex(this.real * a, this.imag * a);
        return Complex.mul(this, a);
    }
    div(a) {
        if (typeof a === 'number')
            return new Complex(this.real / a, this.imag / a);
        return Complex.div(this, a);
    }
    static add(a, b) {
        a = Complex.of(a);
        b = Complex.of(b);
        return new Complex(a.real + b.real, a.imag + b.imag);
    }
    static sub(a, b) {
        a = Complex.of(a);
        b = Complex.of(b);
        return new Complex(a.real - b.real, a.imag - b.imag);
    }
    static mul(a, b) {
        return new Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
    }
    static div(a, b) {
        return a.mul(b.conj()).mul(1 / b.abs());
    }
    toString() {
        const real = String(this.real);
        const imag = String(this.imag);
        return imag[0] === '-' ? real + imag + 'i' : real + '+' + imag + 'i';
    }
}
Complex.i = new Complex(0, 1);
function testMath() {
    console.log(new Complex(2).pow(6));
}
