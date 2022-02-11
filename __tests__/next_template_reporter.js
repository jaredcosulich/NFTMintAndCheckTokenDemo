class NextTemplateReporter {

  report(data) {
    console.log("NEXTTEMPLATEREPORTSTART" + JSON.stringify(data) + "NEXTTEMPLATEREPORTEND")
  }

  async onTestCaseResult(test, testResult, _results) {
    // console.dir(testResult)

    const failureDetails = testResult.failureDetails
    const filteredFailureDetails = failureDetails && failureDetails.length ?
      failureDetails
        .filter(details => details.matcherResult)
        .map(details => details.matcherResult) :
      null

    this.report({ 
      testResult: {
        path: test.path,
        status: testResult.status,
        fullName: testResult.fullName,
        failureDetails: filteredFailureDetails,
        failureMessage: testResult.failureMessage
      }
    })
  }

  async onRunStart(run, estimates) {
    this.report({
      runStart: {
        startTime: run.startTime
      }
    })
  }

  async onTestStart(test) {
    this.report({ 
      testStart: {
        path: test.path
      }
    })
  }

  async onTestResult(test, testResult, _results) {
    if (testResult.failureMessage) {
      this.report({ 
        testResult: {
          path: test.path,
          failureMessage: testResult.failureMessage
        }
      })
    }
    // this.report({ 
    //   testResult: {
    //     path: test.path,
    //     status: testResult.testResults[0]?.status,
    //     message: testResult.testResults[0]?.fullName,
    //     failureMessage: testResult.failureMessage
    //   }
    // })
  }

  async onRunComplete(_contexts, results) {
    const config = _contexts.values().next().value.config;
    const rootPath = config.cwd + '/';

    const passFailResults = {}
    results.testResults.forEach(
      (testResult) => {
        const testFileResults = {}
        testResult.testResults.forEach(
          (result) => testFileResults[result.fullName] = result.status
        )
        const path = testResult.testFilePath.replace(rootPath, '')
        passFailResults[path] = testFileResults
      }
    )
    this.report({ 
      runComplete: passFailResults
    })
  }
}

module.exports = NextTemplateReporter;