laraImport("lara.benchmark.InlineBenchmarkInstance");
laraImport("lara.benchmark.InlineBenchmarkResources");

laraImport("lara.benchmark.BenchmarkSet");

laraImport("lara.util.PredefinedStrings");
laraImport("lara.util.StringSet");
laraImport("lara.Io");

/**
 * Set of benchmarks to test inlining.
 */
class InlineBenchmarkSet extends BenchmarkSet {
  #benchmarks = ["k_means", "matrix_mult", "vec_multiple_returns"];

  constructor() {
    // Parent constructor
    super("InlineBenchmarkSet");

    this._benchmarkNames = new PredefinedStrings(
      "benchmark name",
      true,
      this.#benchmarks
    );

    // By default, all benchmarks
    this._testBenchmarks = this._benchmarkNames.values();
  }

  /**
   * @return {lara.util.PredefinedStrings} the benchmark names.
   */
  getBenchmarkNames() {
    return this._benchmarkNames;
  }

  setBenchmarks() {
    this._testBenchmarks = this.getBenchmarkNames().parse(
      arrayFromArgs(arguments)
    );
  }

  /**
   * Prints the current Polybench benchmark set.
   */
  print() {
    println("BenchmarkSet: " + this.getName());
    println("Benchmark names: " + this._testBenchmarks);
  }

  /*** IMPLEMENTATIONS ***/

  _getInstancesPrivate() {
    var instances = [];

    for (var benchName of this._testBenchmarks) {
      instances.push(new InlineBenchmarkInstance(benchName));
    }

    return instances;
  }
}
