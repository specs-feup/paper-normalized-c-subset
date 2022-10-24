laraImport("JsonConverter");

laraImport("lara.Io");

const conv = new JsonConverter();

// Load inlining results
const inliningData = Io.readJson(
  "results/inliner-test (All 2022-10-23 Linux).json"
);

const inlinedCsv = conv.inliningResults(inliningData);
Io.writeFile("inlinedCalls.csv", inlinedCsv);
println("Wrote 'inlinedCalls.csv'");
println(inlinedCsv);
