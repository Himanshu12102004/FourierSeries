class Complex {
  constructor(real, imag) {
    this.re = real;
    this.im = imag;
  }
  add(cplx) {
    this.re += cplx.re;
    this.im += cplx.im;
  }
  scalerMultiply(s) {
    // console.log("Multiplying Factor", s);
    this.re *= s;
    this.im *= s;
  }
  radius() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }
  angle() {
    return Math.atan2(this.im, this.re);
  }
}
export default Complex;
