function rotationMatrix(matrix, theta, [Tx, Ty]) {
  matrix[0] = Math.cos(theta);
  matrix[1] = -Math.sin(theta);
  matrix[2] = Tx;
  matrix[3] = Math.sin(theta);
  matrix[4] = Math.cos(theta);
  matrix[5] = Tx;
  matrix[8] = 1;
}
export default rotationMatrix;
