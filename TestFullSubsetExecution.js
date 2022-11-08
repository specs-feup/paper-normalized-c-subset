laraImport("InlineExecutor");
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

const totalResults = {};

const useSubsetOpts = [true, false];
const optLevels = ["-O0", "-O2"];
const compilers = ["gcc", "clang"];

/*
const useSubsetOpts = [true];
const optLevels = ["-O2"];
const compilers = ["gcc"];
*/

const runs = 8;

for (const useSubset of useSubsetOpts) {
  for (const compiler of compilers) {
    for (const optLevel of optLevels) {
      // Create name
      const useSubsetName = useSubset ? "Subset" : "Original";
      const testName =
        useSubsetName + "_" + optLevel + "_" + compiler + "_" + runs;

      println("Running test '" + testName + "'");

      const testResult = ClavaBenchmarks.testBenchmarks(
        benchSets,
        (instance) =>
          new InlineExecutor(
            false,
            optLevel,
            compiler,
            runs,
            useSubset
          ).execute(instance),
        filter
      );

      totalResults[testName] = testResult;

      Io.writeJson("subset-execution-test-partial.json", totalResults);
    }
  }
}

Io.writeJson("subset-execution-test.json", totalResults);
