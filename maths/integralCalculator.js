import Complex from "./complex.js";
function integralCalculator(fun, p, q, noOfstep, n) {
  let stepSize = (q - p) / noOfstep;
  let integral = new Complex(0, 0);
  integral.add(fun.eval(p, n));
  integral.add(fun.eval(q, n));
  // console.log(stepSize);
  for (let i = 1; i < noOfstep; i++) {
    const cplx = fun.eval(p + i * stepSize, n);
    // console.log(cplx);
    // console.log(p + i * stepSize);
    cplx.scalerMultiply(2);
    integral.add(cplx);
    // console.log(integral);
  }
  integral.scalerMultiply(stepSize / 2);
  return integral;
}

export default integralCalculator;
