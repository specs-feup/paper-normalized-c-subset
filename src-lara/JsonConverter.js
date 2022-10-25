laraImport("lara.Strings");

class JsonConverter {
  inliningResultsV1(
    obj,
    configs = [
      "normFalseNewFalse",
      "normTrueNewFalse",
      "normFalseNewTrue",
      "normTrueNewTrue",
    ]
  ) {
    // Get list of benchmark set-instance pair
    const benchmarkSetsNames = this.#getBenchmarkSetsNames(obj);

    const data = [];

    // Build header
    const header = ["Benchmark"];
    for (const config of configs) {
      header.push(config + "#Calls");
      header.push(config + "%Inlined");
    }

    data.push(header);

    // For each pair, extract data using the sequence of configurations
    for (const setInstance of benchmarkSetsNames) {
      const row = [];
      row.push(setInstance[1]);
      for (const config of configs) {
        const configData = obj[config];
        const instanceData =
          configData[setInstance[0]][setInstance[1]]["result"];
        //printlnObject(instanceData);
        const calls =
          instanceData["calls_total"] - instanceData["calls_no_definition"];

        const inlined = instanceData["calls_inlined"] / calls;

        row.push(calls);
        row.push(inlined);
      }

      data.push(row);
    }

    return this.toCsv(data);
  }

  inliningResults(
    obj,
    configs = [
      "normFalseNewFalse",
      "normFalseNewTrue",
      "normTrueNewFalse",
      "normTrueNewTrue",
    ]
  ) {
    // Get list of benchmark set-instance pair
    const benchmarkSetsNames = this.#getBenchmarkSetsNames(obj);

    const data = [];

    // Build header
    const header = ["Benchmark"];
    let counter = 0;
    for (const config of configs) {
      if (counter % 2 == 0) {
        header.push("#Calls");
      }
      counter++;

      header.push(config + "%Inlined");
    }

    data.push(header);

    // For each pair, extract data using the sequence of configurations
    for (const setInstance of benchmarkSetsNames) {
      const row = [];
      row.push(setInstance[1]);
      let previousCalls = undefined;
      let counter = 0;
      for (const config of configs) {
        const configData = obj[config];
        const instanceData =
          configData[setInstance[0]][setInstance[1]]["result"];
        //printlnObject(instanceData);
        if (counter % 2 == 0) {
          previousCalls =
            instanceData["calls_total"] - instanceData["calls_no_definition"];
          row.push(previousCalls);
        }
        counter++;

        const inlined = instanceData["calls_inlined"] / previousCalls;

        row.push(inlined);
      }

      data.push(row);
    }

    return this.toCsv(data);
  }

  toCsv(table) {
    /*
    let csv = "data:text/csv;charset=utf-8,";

    for (const row of table) {
      row.join(",");
    }

    return csv;
    */
    return (
      //"data:text/csv;charset=utf-8," +
      table.map((e) => e.join(",")).join("\n")
    );
  }

  #getBenchmarkSetsNames(obj) {
    // Check just the first set of options
    const benchesExample = Object.values(obj)[0];

    const benchmarkSetsNames = [];
    for (const benchSet in benchesExample) {
      for (const benchInstance in benchesExample[benchSet]) {
        benchmarkSetsNames.push([benchSet, benchInstance]);
        //println(benchInstance);
      }
    }

    return benchmarkSetsNames;
  }

  executionResults(obj) {
    // Examples:
    // Inlining_-O0_gcc_2
    // NotInlining_-O2_gcc

    const configs = [
      ["NotInlining", "Inlining"],
      ["-O0", "-O2"],
      ["clang", "gcc"],
    ];

    // Find first set that uses inlining
    let baseSet = undefined;
    for (const key in obj) {
      if (key.startsWith("Inlining_")) {
        baseSet = obj[key];
        break;
      }
    }

    if (baseSet === undefined) {
      throw new Error("Could not find base set");
    }

    // Get list of benchmark set-instance pair
    let benchmarkSetsNames = this.#getBenchmarkSetsNames(obj);

    // Filter benchmarks that were successful
    benchmarkSetsNames = benchmarkSetsNames.filter((names) =>
      this.#isSuccessExecutionSet(names, baseSet)
    );

    // Extract runs
    const runs =
      baseSet[benchmarkSetsNames[0][0]][benchmarkSetsNames[0][1]]["result"][
        "runs"
      ];

    const data = [];

    const header = ["Benchmark"];
    for (const comp of configs[2]) {
      for (const opt of configs[1]) {
        const base = comp + "_" + opt + " Base (ms)";
        header.push(base);
        header.push("Speedup");
      }
    }

    data.push(header);

    // For each benchmark, extract data using the sequence of configurations
    for (const benchmarkNames of benchmarkSetsNames) {
      const row = [];
      row.push(benchmarkNames[1]);
      let counter = 0;
      let baseTime = undefined;
      for (const comp of configs[2]) {
        for (const opt of configs[1]) {
          for (const inlining of configs[0]) {
            const setName = inlining + "_" + opt + "_" + comp + "_" + runs;
            const set = obj[setName];

            if (set === undefined) {
              throw new Error("Could not find set " + setName);
            }

            const data =
              set[benchmarkNames[0]][benchmarkNames[1]]["result"]["runOutputs"];

            const execTimes = data.map(this.#extractExecutionTime);

            if (counter % 2 == 0) {
              const sum = execTimes.reduce((a, b) => a + b, 0);
              const avg = sum / execTimes.length;
              baseTime = avg;
              row.push(baseTime);
            } else {
              const sum = execTimes.reduce((a, b) => a + b, 0);
              const avg = sum / execTimes.length;
              const speedup = baseTime / avg;
              row.push(speedup);
            }
            counter++;
            //println("Exec times: " + execTimesRaw);

            // Get execution times
            //printlnObject(data);
            //row.push();
          }
        }
      }

      data.push(row);
    }

    return this.toCsv(data);
  }

  #extractExecutionTime(output) {
    const prefix = "Test execution time: ";
    // Extract correct line
    let execTime = Strings.extractValue(prefix, output);
    /*
    println("Exec time raw: " + execTimeRaw);
    println("Exec time raw len: " + execTimeRaw.length);
    println("Prefix: " + prefix);
    println("Prefix len: " + prefix.length);
    */
    //let execTime = execTimeRaw.substring(prefix.length, execTimeRaw.length);

    if (!execTime.endsWith("ms")) {
      throw new Error("Expected to end with 'ms': '" + execTime + "'");
    }

    execTime = execTime.substring(0, execTime.length - "ms".length);

    return Number(execTime);
  }

  #isSuccessExecutionSet(names, obj) {
    const data = obj[names[0]][names[1]];

    // Check success
    if (!data["success"]) {
      println(`Ignoring ${names[1]}`);
      return false;
    }

    // Check return values
    const returnValues = data["result"]["returnValues"];

    for (const value of returnValues) {
      if (value !== 0) {
        println(`Ignoring ${names[1]}`);
        return false;
      }
    }

    return true;
  }
}
