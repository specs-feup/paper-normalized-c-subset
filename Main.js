laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");
laraImport("InlineCollector");

function windowsCmakerProvider() {
	return new CMaker()
		.setGenerator("MinGW Makefiles")
		.setMakeCommand("mingw32-make");
}

var benches = new InlineBenchmarkSet();

benches.setCMakerProvider(windowsCmakerProvider);

var inlineCollector = new InlineCollector(false, false);

for(const instance of benches) {
	println("Bench: " + instance.getName());
//	instance.execute();

	inlineCollector.collect();
}
