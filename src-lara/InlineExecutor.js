laraImport("clava.opt.Inlining");
laraImport("clava.opt.NormalizeToSubset");
laraImport("weaver.Query");
laraImport("lara.code.Timer");

class InlineExecutor {
  #useInliner;
  #optLevel;
  #compiler;
  #runs;
  #subset;

  constructor(useInliner, optLevel, compiler, runs, subset = false) {
    this.#useInliner = useInliner ?? true;
    this.#optLevel = optLevel ?? "-O2";
    this.#compiler = compiler ?? "gcc";
    this.#runs = runs ?? 5;
    this.#subset = subset;
  }

  execute(instance) {
    // Measure time around kernel
    const timer = new Timer();
    timer.time(instance.getKernel(), "Test execution time: ");

    // Applies subset normalization to the code
    if (this.#subset) {
      NormalizeToSubset(Query.root());
    }

    // Inlines everything inside main() function
    if (this.#useInliner) {
      Inlining();
    }

    const cmaker = instance.getCMaker();
    cmaker.addFlags(this.#optLevel);
    cmaker.setCompiler(this.#compiler);

    let runOutputs = [];
    let returnValues = [];
    for (let i = 0; i < this.#runs; i++) {
      const executor = instance.execute();
      //println("Console output:\n" + executor.getConsoleOutput());
      runOutputs.push(executor.getConsoleOutput());
      returnValues.push(executor.getReturnValue());
    }
    //println("After:\n" + Query.root().code);

    const executionTime = [10, 11, 9];
    const useInliner = this.#useInliner;
    const optLevel = this.#optLevel;
    const compiler = this.#compiler;
    const runs = this.#runs;
    const results = {
      runOutputs,
      returnValues,
      useInliner,
      optLevel,
      compiler,
      runs,
    };
    //const results = { this.#useInliner, runs,
    //    this.#optLevels, executionTime };

    return results;
  }
}
