laraImport("JsonConverter");

laraImport("lara.Io");

const conv = new JsonConverter();

function inliningResults() {
  // Load inlining results
  const inliningData = Io.readJson(
    "results/inliner-test (All 2022-10-23 Linux).json"
  );

  const inlinedCsv = conv.inliningResults(inliningData);
  Io.writeFile("inlinedCalls.csv", inlinedCsv);
  println("Wrote 'inlinedCalls.csv'");
  println(inlinedCsv);
}

function executionResults() {
  // Load execution results
  const executionData = Io.readJson(
    "results/inliner-execution-test (All 2022-10-24 Linux).json"
  );

  const executionCsv = conv.executionResults(executionData);

  Io.writeFile("executionComparison.csv", executionCsv);
  println("Wrote 'executionComparison.csv'");
  println(executionCsv);
}

executionResults();
