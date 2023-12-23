import Complex from "./complex.js";

class ComplexFunction {
  constructor(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
    this.realFunction = math.evaluate(`f(x,n)=${this.real}`);
    this.imaginaryFunction = math.evaluate(`f(x,n)=${this.imaginary}`, {});
  }
  eval(x, n) {
    return new Complex(this.realFunction(x, n), this.imaginaryFunction(x, n));
  }
  static multiply(function1, function2) {
    const realPart = `${function1.real}*${function2.real}-(${function1.imaginary}*${function2.imaginary})`;
    const imagPart = `${function1.imaginary}*${function2.real}+${function1.real}*${function2.imaginary}`;
    return new ComplexFunction(realPart, imagPart);
  }
}
export default ComplexFunction;
