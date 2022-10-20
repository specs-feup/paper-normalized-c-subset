laraImport("InlineCollector");
laraImport("ClavaBenchmarks");

laraImport("clava.opt.NormalizeToSubset");

laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");
laraImport("lara.Io");

function testInlineBench() {
  var benches = new InlineBenchmarkSet();

  benches.setCMakerProvider(ClavaBenchmarks.getDefaultCMakerProvider);

  var inlineCollector = new InlineCollector(false, false);

  for (const instance of benches) {
    println("Bench: " + instance.getName());
    //	instance.execute();

    inlineCollector.collect();
    break;
  }
}

function testSubset(benchmarkInstance) {
  // Normalize do subset
  NormalizeToSubset();

  // Rebuild, to test if code is ok
  Clava.rebuild();

  return "Ok";
}

function createSubsetFilter() {
  // Consider all benchmark sets
  const benchSets = [
    ...ClavaBenchmarks.getDefaultBenchmarkSets(),
    new InlineBenchmarkSet(),
  ];

  // Apply subset to all benchmarks
  for (const bench of benchSets) {
    //println("Benchmark: " + bench.getName());

    // Obtain benchmark results
    const results = ClavaBenchmarks.testBenchmarkSet(bench, testSubset, filter);

    benchResults[bench.getName()] = results;

    // Save partial results
    Io.writeJson("support_subset_partial.json", benchResults);
  }

  // Save final results
  Io.writeJson("support_subset.json", benchResults);
}

const benchSets = [
  ClavaBenchmarks.getBenchmark("CHStone"),
  ClavaBenchmarks.getBenchmark("NAS"),
  new InlineBenchmarkSet(),
];

const filter = Io.readJson("support_subset (Windows 2022-10-20).json");

const totalResults = {};

const normTrueNewTrue = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) =>
    new InlineCollector(
      (normalizeFunction = true),
      (newInliner = true)
    ).collect(),
  filter
);

totalResults["normTrueNewTrue"] = normTrueNewTrue;

Io.writeJson("inliner-test-partial.json", totalResults);

const normFalseNewTrue = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) =>
    new InlineCollector(
      (normalizeFunction = false),
      (newInliner = true)
    ).collect(),
  filter
);

totalResults["normFalseNewTrue"] = normFalseNewTrue;

Io.writeJson("inliner-test-partial.json", totalResults);

const normTrueNewFalse = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) =>
    new InlineCollector(
      (normalizeFunction = true),
      (newInliner = false)
    ).collect(),
  filter
);

totalResults["normTrueNewFalse"] = normTrueNewFalse;

Io.writeJson("inliner-test-partial.json", totalResults);

const normFalseNewFalse = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) =>
    new InlineCollector(
      (normalizeFunction = false),
      (newInliner = false)
    ).collect(),
  filter
);

totalResults["normFalseNewFalse"] = normFalseNewFalse;

Io.writeJson("inliner-test.json", totalResults);

/*
const benchResults = {};
for (const bench of benchSets) {
  //println("Benchmark: " + bench.getName());

  // Obtain benchmark results
  const results = ClavaBenchmarks.testBenchmarkSet(bench, nop, filter);

  benchResults[bench.getName()] = results;
}
*/
