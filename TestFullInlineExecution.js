laraImport("InlineExecutor");
laraImport("ClavaBenchmarks");

laraImport("clava.opt.NormalizeToSubset");

laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");
laraImport("lara.Io");

setDebug(true);

const chstone = new CHStoneBenchmarkSet();
chstone.setBenchmarks("aes");

const nas = new NasBenchmarkSet();
nas.setBenchmarks("MG");

const benchSets = [
  //chstone,
  //nas,
  //ClavaBenchmarks.getBenchmark("CHStone"),
  //ClavaBenchmarks.getBenchmark("NAS"),
  new InlineBenchmarkSet(),
];

const filter = Io.readJson("support_subset (Windows 2022-10-20).json");

const totalResults = {};

const useInlinerOpts = [true, false];
const optLevels = ["-O0", "-O2"];
const compilers = ["gcc", "clang"];

const runs = 2;

for (const useInliner of useInlinerOpts) {
  for (const compiler of compilers) {
    for (const optLevel of optLevels) {
      // Create name
      const useInlinerName = useInliner ? "Inlining" : "NotInlining";
      const testName =
        useInlinerName + "_" + optLevel + "_" + compiler + "_" + runs;

      println("Running test '" + testName + "'");

      const testResult = ClavaBenchmarks.testBenchmarks(
        benchSets,
        (instance) =>
          new InlineExecutor(useInliner, optLevel, compiler, runs).execute(
            instance
          ),
        filter
      );

      totalResults[testName] = testResult;

      Io.writeJson("inliner-execution-test-partial.json", totalResults);
    }
  }
}

Io.writeJson("inliner-execution-test.json", totalResults);
