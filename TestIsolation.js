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
nas.setBenchmarks("LU");

for (const instance of nas) {
  // Apply normalization
  NormalizeToSubset(Query.root());

  // Rebuild
  Clava.rebuild();
}
