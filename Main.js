laraImport("lara.benchmark.InlineBenchmarkSet");
laraImport("lara.cmake.CMaker");

function windowsCmakerProvider() {
	return new CMaker()
		.setGenerator("MinGW Makefiles")
		.setMakeCommand("mingw32-make");
}

var benches = new InlineBenchmarkSet();

benches.setCMakerProvider(windowsCmakerProvider);

for(const instance of benches) {
	println("Bench: " + instance.getName());
	instance.execute();
}
