laraImport("clava.opt.Inlining");
laraImport("weaver.Query");
laraImport("lara.code.Timer");

class InlineExecutor {
  #useInliner;
  #optLevel;
  #compiler;

  #runs;

  constructor(useInliner, optLevel, compiler, runs) {
    this.#useInliner = useInliner ?? true;
    this.#optLevel = optLevel ?? "-O2";
    this.#compiler = compiler ?? "gcc";
    this.#runs = runs ?? 5;
  }

  execute(instance) {
    // Measure time around kernel
    const timer = new Timer();
    timer.time(instance.getKernel(), "Test execution time: ");

    //println("Instance: " + instance.getName());
    //println("Before:\n" + Query.root().code);
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
