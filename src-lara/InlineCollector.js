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
    }

    for (const call of Query.search("call")) {
      calls_total += 1;

      // Ignore calls to functions that have no code available
      if (!call.function.isImplementation) {
        calls_no_definition += 1;
        continue;
      }

      // In Windows, these functions have implementation, do not count them
      const functionName = call.function.name;
      if (functionName === "printf" || functionName === "fprintf") {
        calls_no_definition += 1;
        continue;
      }

      // Save AST
      Clava.pushAst();

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
}
