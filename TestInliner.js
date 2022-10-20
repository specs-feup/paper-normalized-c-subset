laraImport("InlineCollector");
laraImport("ClavaBenchmarks");

laraImport("clava.opt.NormalizeToSubset");

laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");
laraImport("lara.Io");

const benchSets = [
  ClavaBenchmarks.getBenchmark("CHStone"),
  ClavaBenchmarks.getBenchmark("NAS"),
  new InlineBenchmarkSet(),
];

const filter = Io.readJson("support_subset (Windows 2022-10-20).json");

const totalResults = {};

const normTrueNewTrue = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) => new InlineCollector(true, true).collect(),
  filter
);

totalResults["normTrueNewTrue"] = normTrueNewTrue;

Io.writeJson("inliner-test-partial.json", totalResults);

const normFalseNewTrue = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) => new InlineCollector(false, true).collect(),
  filter
);

totalResults["normFalseNewTrue"] = normFalseNewTrue;

Io.writeJson("inliner-test-partial.json", totalResults);

const normTrueNewFalse = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) => new InlineCollector(true, false).collect(),
  filter
);

totalResults["normTrueNewFalse"] = normTrueNewFalse;

Io.writeJson("inliner-test-partial.json", totalResults);

const normFalseNewFalse = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) => new InlineCollector(false, false).collect(),
  filter
);

totalResults["normFalseNewFalse"] = normFalseNewFalse;

Io.writeJson("inliner-test.json", totalResults);
