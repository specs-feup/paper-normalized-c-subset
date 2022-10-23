laraImport("lara.benchmark.CHStoneBenchmarkSet");
laraImport("lara.benchmark.HiFlipVXBenchmarkSet");
//laraImport("lara.benchmark.CHStoneBenchmarkSet");
laraImport("lara.benchmark.NasBenchmarkSet");
laraImport("lara.benchmark.ParboilBenchmarkSet");
laraImport("lara.benchmark.PolybenchBenchmarkSet");
laraImport("lara.benchmark.RosettaBenchmarkSet");

laraImport("lara.Platforms");

class ClavaBenchmarks {
  /**
   * Names of classes represeting Clava BenchmarkSets
   */
  static #benchmarkSets = {
    CHStone: CHStoneBenchmarkSet,
    HiFlipVX: HiFlipVXBenchmarkSet,
    //CHStoneBenchmarkSet, #LSU, not yet implemented
    NAS: NasBenchmarkSet,
    Parboil: ParboilBenchmarkSet,
    Polybench: PolybenchBenchmarkSet,
    Rosetta: RosettaBenchmarkSet,
  };
  static getDefaultCMakerProvider() {
    if (Platforms.isWindows()) {
      return ClavaBenchmarks.getWindowsCMakerProvider();
    }

    return undefined;
  }

  static getWindowsCMakerProvider() {
    return new CMaker()
      .setGenerator("MinGW Makefiles")
      .setMakeCommand("mingw32-make");
  }

  static getDefaultBenchmarkSets() {
    const benches = [];

    for (const bench of Object.values(ClavaBenchmarks.#benchmarkSets)) {
      benches.push(new bench());
    }

    return benches;
  }

  static getBenchmark(name) {
    const bench = ClavaBenchmarks.#benchmarkSets[name];

    if (bench === undefined) {
      throw `Invalid benchmark name '${name}', available benchmarks: ${Object.keys(
        ClavaBenchmarks.#benchmarkSets
      )}`;
    }

    var argsArray = arrayFromArgs(arguments, 1);

    return new bench(...argsArray);
  }

  static testBenchmarkSet(benchSet, test, filter) {
    println("BenchmarkSet: " + benchSet.getName());

    // Setting default CMaker provider
    benchSet.setCMakerProvider(ClavaBenchmarks.getDefaultCMakerProvider);

    const instances = ClavaBenchmarks.getInstances(benchSet, filter);

    //const instances = benchSet.getInstances();

    let current = 0;
    const results = {};
    for (const instance of instances) {
      current++;
      println(
        `Benchmark: ${instance.getName()} (${current}/${instances.length})`
      );

      instance.load();

      try {
        const instanceResult = test(instance);
        results[instance.getName()] = { result: instanceResult, success: true };
      } catch (e) {
        const message =
          "[ERROR] problems while testing instance '" +
          instance.getName() +
          ": " +
          e;
        println(message);
        //println(e.stack);
        //throw e;
        results[instance.getName()] = { result: message, success: false };
      }

      instance.close();
    }

    return results;
  }

  static testBenchmarks(benchSets, test, filter) {
    const benchResults = {};

    for (const bench of benchSets) {
      // Obtain benchmark results
      const results = ClavaBenchmarks.testBenchmarkSet(bench, test, filter);

      benchResults[bench.getName()] = results;
    }

    return benchResults;
  }

  static #validInstance(filter, benchName, instanceName) {
    if (filter === undefined) {
      return true;
    }
    //println("Testing bench name: " + benchName);
    const benchData = filter[benchName];

    if (benchData === undefined) {
      return true;
    }
    //println("Testing instance name: " + instanceName);
    const instanceData = benchData[instanceName];

    if (instanceName === undefined) {
      return true;
    }

    //println("Testing succe: " + instanceData["success"]);
    //printlnObject(instanceData);
    return instanceData["success"] ?? true;
  }

  static getInstances(benchSet, filter) {
    const instances = [];

    for (const instance of benchSet.getInstances()) {
      const isValidInstance = ClavaBenchmarks.#validInstance(
        filter,
        benchSet.getName(),
        instance.getName()
      );

      if (!isValidInstance) {
        debug(
          "Skipping benchmark instance '" +
            instance.getName() +
            "' due to filter"
        );

        continue;
      }

      instances.push(instance);
    }

    return instances;
  }
}
