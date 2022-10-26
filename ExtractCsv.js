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

function inlinerExecutionResults() {
  // Load execution results
  const executionData = Io.readJson(
    "results/inliner-execution-test (All 2022-10-24 Linux).json"
  );

  const executionCsv = conv.executionResults(executionData);

  Io.writeFile("executionComparison.csv", executionCsv);
  println("Wrote 'executionComparison.csv'");
  println(executionCsv);
}

function normalizationExecutionResults() {
  // Load execution results
  const executionData = Io.readJson(
    "results/subset-execution-test (Linux 2022-10-25).json"
  );

  const executionCsv = conv.executionResults(
    executionData,
    [
      ["Original", "Subset"],
      ["-O0", "-O2"],
      ["clang", "gcc"],
    ],
    (prefixFirst = "Subset_")
  );

  Io.writeFile("normalizationExecutionComparison.csv", executionCsv);
  println("Wrote 'normalizationExecutionComparison.csv'");
  println(executionCsv);
}

normalizationExecutionResults();
