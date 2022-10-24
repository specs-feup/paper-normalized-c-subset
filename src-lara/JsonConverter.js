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
}
