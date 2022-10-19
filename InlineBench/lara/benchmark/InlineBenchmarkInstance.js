laraImport("lara.benchmark.ClavaBenchmarkInstance");
laraImport("lara.benchmark.InlineBenchmarkResources");

laraImport("clava.Clava");
laraImport("clava.ClavaJoinPoints");

laraImport("weaver.WeaverJps");

/**
 * Instance of a C Polybench benchmark.
 */
class InlineBenchmarkInstance extends ClavaBenchmarkInstance {
  constructor(benchmarkName) {
    super("Inlinebench-" + benchmarkName);

    this._benchmarkName = benchmarkName;

    this._previousStandard = undefined;

    // Add -lm
    this.getCMaker().addLibs("m");
  }

  /*** IMPLEMENTATIONS ***/

  _loadPrologue() {
    // Set standard
    this._previousStandard = Clava.getData().getStandard();
    Clava.getData().setStandard("c99");
  }

  _loadPrivate() {
    // Save current AST
    Clava.pushAst();

    // Clean AST
    WeaverJps.root().removeChildren();

    // Add code
    this._addCode();

    // Rebuild
    Clava.rebuild();
  }

  _closePrivate() {
    // Restore standard
    Clava.getData().setStandard(this._previousStandard);
    this._previousStandard = undefined;

    // Restore previous AST
    Clava.popAst();
  }

  _addCode() {
    // Create array with source files
    var sourceFiles = [];
    sourceFiles.push(this._benchmarkName + ".c");

    // Add files to tree
    for (var filename of sourceFiles) {
      var file = InlineBenchmarkResources.getFile(filename);
      var clavaJPFile = ClavaJoinPoints.file(file);
      Clava.addFile(clavaJPFile);
    }
  }
}
