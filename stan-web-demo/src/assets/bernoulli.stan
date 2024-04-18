data {
  int<lower=0> N;
  array[N] int<lower=0, upper=1> y;
}
parameters {
  real<lower=0, upper=1> theta;
}
model {
  // uniform prior on interval 0,1
  theta ~ beta(1, 1);
  y ~ bernoulli(theta);
}
