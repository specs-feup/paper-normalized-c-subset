laraImport("BenchmarkCharacterizer");
laraImport("ClavaBenchmarks");

laraImport("clava.opt.NormalizeToSubset");

laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");
laraImport("lara.Io");

//setDebug(true);

const chstone = new CHStoneBenchmarkSet();
chstone.setBenchmarks("aes");

const nas = new NasBenchmarkSet();
nas.setBenchmarks("EP");

const benchSets = [
  //chstone,
  //nas,
  ClavaBenchmarks.getBenchmark("CHStone"),
  ClavaBenchmarks.getBenchmark("NAS"),
  new InlineBenchmarkSet(),
];

const filter = Io.readJson("support_subset (Windows 2022-10-24).json");

println("Characterizing benchmarks");

const totalResults = ClavaBenchmarks.testBenchmarks(
  benchSets,
  (instance) => new BenchmarkCharacterizer().execute(instance),
  filter
);

println("Writing benchmark-characterization.json");
Io.writeJson("benchmark-characterization.json", totalResults);
