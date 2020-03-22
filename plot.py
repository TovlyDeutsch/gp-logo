# Original Authors: Vincent Dubourg <vincent.dubourg@gmail.com>
#                   Jake Vanderplas <vanderplas@astro.washington.edu>
#                   Jan Hendrik Metzen <jhm@informatik.uni-bremen.de>
# Modified by: Tovly Deutsch
# License: BSD 3 clause

import numpy as np
from matplotlib import pyplot as plt
import random
import json

from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C


def v(x):
  """The function to predict."""
  return 3 * abs(x)


def plot(axs, filename):
  def range_ran(a, b, num_values=1):
    return [random.uniform(a, b) for _ in range(num_values)]
  random_x_vals = sorted(range_ran(-10, -9, 5) + range_ran(9,
                                                           10, 5) + range_ran(-2, 2, 100) + range_ran(-10, 10, 15))
  # print(random_x_vals)
  X = np.atleast_2d(random_x_vals).T
  # X = np.atleast_2d([float(x) for x in np.arange(-10, 10, 2.5)]).T

  # Observations
  y = v(X).ravel()
  noise_amount = 3.0
  dy = 0.5 + noise_amount * np.random.random(y.shape)
  noise = np.random.normal(0, dy)
  y += noise

  # Mesh the input space for evaluations of the real function, the prediction and
  # its MSE
  x = np.atleast_2d(np.linspace(-10, 10, 100)).T

  # Instantiate a Gaussian Process model
  kernel = C(1e-10, (1e-3, 1e3)) * RBF(10, (1e-2, 1e2))
  # kernel = Matern(1e-10)
  gp = GaussianProcessRegressor(kernel=kernel, alpha=dy ** 2,
                                n_restarts_optimizer=10,
                                normalize_y=True)

  # Fit to data using Maximum Likelihood Estimation of the parameters
  gp.fit(X, y)

  # Make the prediction on the meshed x-axis (ask for MSE as well)
  y_pred = gp.predict(x)
  x_list = x.tolist()
  json.dump([[x_list[i][0], y] for (i, y) in enumerate(
      y_pred.tolist())], open(filename, 'w'))

  # Plot the function, the prediction and the 95% confidence interval based on
  # the MSE
  # axs.figure()
  axs.plot(x, v(x), 'r:', label=r'$f(x) = x\,\sin(x)$')
  axs.plot(X, y, 'r.', markersize=10, label='Observations')
  axs.plot(x, y_pred, 'b-', label='Prediction')
  # axs.xlabel('$x$')
  # axs.ylabel('$f(x)$')
  # axs.ylim(-10, 20)
  # axs.legend(loc='upper left')
  # plt.show()


if __name__ == "__main__":
  num_plots = 10
  fig, axs = plt.subplots(num_plots)
  fig.suptitle('Vertically stacked subplots')
  for i in range(num_plots):
    plot(axs[i], f'graph{i}.json')
  F = plt.gcf()
  Size = F.get_size_inches()
  F.set_size_inches(Size[0] * 0.4, Size[1] * 1.3, forward=True)
  # plt.show()
