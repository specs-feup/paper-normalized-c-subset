laraImport("clava.opt.NormalizeToSubset");
laraImport("clava.opt.PrepareForInlining");

laraImport("clava.code.Inliner");
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

    if (this.normalizeFunction) {
      NormalizeToSubset();
    }

    for (const call of Query.search("call")) {
      calls_total += 1;
      if (!call.function.isImplementation) {
        calls_no_definition += 1;
        continue;
      }
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
          println("Inlined successfully\n");
          calls_inlined += 1;
        } else {
          const res = call.inline();
          if (res) {
            println("Inlined successfully\n");
            calls_inlined += 1;
          } else {
            println("Inlining failed\n");
            calls_inlining_fails += 1;
          }
        }
      } catch (e) {
        println(`Inlining failed: ${e.message}\n`);
        calls_inlining_fails += 1;
      }
    }

    const results = JSON.stringify(
      {
        calls_total,
        calls_no_definition,
        calls_inlined,
        calls_inlining_fails,
      },
      undefined,
      2
    );

    println("Results:");
    println(results);

    return results;
  }
}
