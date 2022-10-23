laraImport("clava.opt.NormalizeToSubset");
laraImport("clava.opt.PrepareForInlining");

laraImport("clava.code.Inliner");
laraImport("clava.Clava");
laraImport("weaver.Query");

class InlineCollector {
  normalizeFunction;
  newInliner;

  constructor(normalizeFunction = true, newInliner = true) {
    this.normalizeFunction = normalizeFunction;
    this.newInliner = newInliner;
  }

  collect() {
    const norm = this.normalizeFunction ? "Normalizing code" : "Original code";
    const inliner = this.newInliner ? "new inliner" : "old inliner";

    println(norm + ", " + inliner);

    let calls_total = 0;
    let calls_no_definition = 0;
    let calls_inlined = 0;
    let calls_inlining_fails = 0;
    let calls_rebuild_fails = 0;

    if (this.normalizeFunction) {
      NormalizeToSubset();
      Io.writeFile("normalized.c", Query.root().code);
    }

    //const originalCode = Query.root().code;

    //for (const originalCall of Query.search("call", "decode")) {
    for (const originalCall of Query.search("call")) {
      const callFile = originalCall.ancestor("file");
      calls_total += 1;

      // Ignore calls to functions that have no code available
      if (!originalCall.function.isImplementation) {
        calls_no_definition += 1;
        continue;
      }

      // In Windows, these functions have implementation, do not count them
      const functionName = originalCall.function.name;
      if (functionName === "printf" || functionName === "fprintf") {
        calls_no_definition += 1;
        continue;
      }

      // Save AST
      Clava.pushAst();

      // Call must be updated, otherwise it will change the original AST
      const call = Query.search("call", { astId: originalCall.astId }).first();

      try {
        println(
          `Trying to inline call '${call.code}' at location ${call.location}`
        );

        if (this.normalizeFunction) {
          PrepareForInlining(call.function);
        }

        const exprStmt = call.ancestor("exprStmt");

        if (this.newInliner) {
          const inliner = new Inliner();
          inliner.inline(exprStmt);

          try {
            // Rebuild, to test if inline did not introduce errors
            Clava.rebuild();
            println("Inlined successfully\n");
            calls_inlined += 1;
          } catch (e) {
            println(`Rebuild failed: ${e.message}\n`);
            calls_rebuild_fails += 1;
            this.#saveCode(callFile, call);
          }
        } else {
          const res = call.inline();

          if (res) {
            try {
              // Rebuild, to test if inline did not introduce errors
              Clava.rebuild();
              println("Inlined successfully\n");
              calls_inlined += 1;
            } catch (e) {
              println(`Rebuild failed: ${e.message}\n`);
              calls_rebuild_fails += 1;
              this.#saveCode(callFile, call);
            }
          } else {
            println("Inlining failed\n");
            calls_inlining_fails += 1;
          }
        }
      } catch (e) {
        println(`Inlining failed: ${e.message}\n`);
        calls_inlining_fails += 1;
      }

      // Reload AST
      Clava.popAst();

      /*
      const currentCode = Query.root().code;

      if (originalCode !== currentCode) {
        Io.writeFile("original_code.c", originalCode);
        Io.writeFile("current_code.c", currentCode);
        throw "Code has changed!";
      }
      */
    }

    const results = {
      calls_total,
      calls_no_definition,
      calls_inlined,
      calls_inlining_fails,
      calls_rebuild_fails,
    };

    println("Results:");
    println(JSON.stringify(results, undefined, 2));

    return results;
  }

  #saveCode(callFile, call) {
    const filename =
      callFile.file.getParentFile().getName() +
      "_" +
      callFile.name +
      "_" +
      call.name +
      "_" +
      call.line +
      "_" +
      call.loc +
      ".c";
    Io.writeFile(Io.getPath("debug_files", filename), Query.root().code);
    println("Code written to file " + filename);
  }
}
