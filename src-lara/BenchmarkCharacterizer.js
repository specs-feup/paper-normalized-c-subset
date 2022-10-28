laraImport("clava.opt.NormalizeToSubset");
laraImport("clava.opt.Inlining");

laraImport("clava.Clava");

laraImport("lara.util.ProcessExecutor");
laraImport("lara.Strings");
laraImport("lara.Io");

class BenchmarkCharacterizer {
  execute(instance) {
    println("Extracing metrics from : " + instance.getName());

    // Original code
    const originalLoc = this.extractLoc();
    const originalNodeCount = this.extractNodeCount();

    // Apply normalization
    Clava.pushAst();
    NormalizeToSubset(Query.root());
    const normalizedLoc = this.extractLoc();
    const normalizedNodeCount = this.extractNodeCount();
    Clava.popAst();

    // Apply inlining
    Inlining();
    const inlinedLoc = this.extractLoc();
    const inlinedNodeCount = this.extractNodeCount();

    const results = {
      originalLoc,
      originalNodeCount,
      normalizedLoc,
      normalizedNodeCount,
      inlinedLoc,
      inlinedNodeCount,
    };

    return results;
  }

  extractLoc() {
    // Get temp folder and clear it
    const tempFolder = Io.getTempFolder("BenchmarkCharacterization_results");
    Io.deleteFolderContents(tempFolder);

    // Output AST to a temporary folder
    Clava.writeCode(tempFolder);

    // Run cloc on folder
    const executor = new ProcessExecutor();
    executor.execute("cloc", tempFolder.getAbsolutePath());

    const output = executor.getConsoleOutput();
    for (const line of Strings.asLines(output)) {
      const splittedLine = line.split(" ").filter((l) => l.length > 0);
      if (splittedLine[0] !== "C") {
        continue;
      }

      return Number(splittedLine[splittedLine.length - 1]);
    }

    throw new Error("Could not find LoC of C code:\n" + output);
    //    println("Cloc:" + );
    // Extract metrics
  }

  extractNodeCount() {
    // Initialized to 1, to account for the root node
    let counter = 1;

    for (const node of Query.search()) {
      counter++;
    }

    /*
    for (const node of Query.root().descendantsAndSelf("joinpoint")) {
      counter++;
    }
*/
    return counter;
  }
}
