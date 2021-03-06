var spawn = require('child_process').spawn;
var path =require('path');
var platform = require('os').platform();

exports.testDefaults = function(test) {

    test.expect(1);

    nodeUnitToCleanedOutput('defaultOptions', function(err, output) {
        var expectedLines = [
            'test3',
            'Test3 method1',
            'Test3 method2',
            'Test3 async assertions',
            'Test3 async done',
            '✔ testAysncTestAuto',
            'Test3 method3',
            'Test3 method4',
            'Test3 second async assertions',
            'Test3 second async done',
            '✔ testAysncTestWaterfall',
            'Test3 sync assertions',
            'Test3 sync Done',
            '✔ testSyncTest',
            'OK: 6 assertions'
        ];
        if (err) {
            throw err;
        }
        test.deepEqual(expectedLines, output);
        test.done();
    });
};

exports.testFixture = function(test) {

    test.expect(1);

    nodeUnitToCleanedOutput('fixtureOptions', function(err, output) {
        var expectedLines = [
            'test1',
            'fixture setup',
            'global setup',
            'Test1 method1',
            'Test1 method2',
            'Test1 async assertions',
            'Test1 async Done',
            'global teardown',
            '✔ testAysncTestAuto',
            'global setup',
            'Test1 method3',
            'Test1 method4',
            'Test1 second async assertions',
            'Test1 second async done',
            'global teardown',
            '✔ testAysncTestWaterfall',
            'global setup',
            'Test1 sync assertions',
            'Test1 sync done',
            'global teardown',
            '✔ testSyncTest',
            'test2',
            'global setup',
            'Test2 method1',
            'Test2 method2',
            'Test2 async assertions',
            'Test2 async done',
            'global teardown',
            '✔ testAysncTest',
            'global setup',
            'Test2 sync assertions',
            'Test2 sync done',
            'global teardown',
            '✔ testSyncTest',
            'OK: 9 assertions',
            'fixture teardown'
        ];
        if (err) {
            throw err;
        }
        test.deepEqual(expectedLines, output);
        test.done();
    });
};

exports.testWithFailures = function(test) {

    test.expect(1);

    nodeUnitToCleanedOutput('testWithErrors', function(err, output) {
        var expectedLines = [ 'test4',
            'testAysncTestAutoCallbackError',
            'fixture setup',
            'global setup',
            '✖ testAysncTestAutoCallbackError',
            'Error: Auto Callback Error',
            'Error: Expected 1 assertions, 0 ran',
            'testAysncTestAutoThrownError',
            'global setup',
            '✖ testAysncTestAutoThrownError',
            'Error: Auto Thrown Error',
            'Error: Expected 1 assertions, 0 ran',
            'testAysncTestWaterfallCallbackError',
            'global setup',
            '✖ testAysncTestWaterfallCallbackError',
            'Error: Waterfall Callback Error',
            'Error: Expected 1 assertions, 0 ran',
            'testAysncTestWaterfallThrownError',
            'global setup',
            '✖ testAysncTestWaterfallThrownError',
            'Error: Waterfall Callback Error',
            'Error: Expected 1 assertions, 0 ran',
            'testSyncTestThrownError',
            'global setup',
            '✖ testSyncTestThrownError',
            'Error: Sync Thrown Error',
            'testThatWillPass',
            'global setup',
            'global teardown',
            '✔ testThatWillPass',
            'FAILURES: 9/11 assertions failed'
        ];

        test.deepEqual(expectedLines, output);
        test.done(err);
    });
};


function nodeUnitToCleanedOutput(dummyTestFolder, callback) {
    var cmd = platform !== 'win32' ? path.join('node_modules', 'nodeunit', 'bin', 'nodeunit')
                                   : path.join('node_modules', '.bin', 'nodeunit.cmd');

    var args = [path.join('test', 'dummyTests', dummyTestFolder)];
    var testOutput = '';
    var testError = '';
    var cwd = path.join(__dirname,'..');

    var nodeunit = spawn(cmd, args, {cwd: cwd});

    nodeunit.stdout.on('data', function (data) {
        testOutput += data;
    });

    nodeunit.stderr.on('data', function (data) {
        testError += data;
    });

    nodeunit.on('close', function (exitCode) {

        var rawOutputLines = [];


        if (testError) {
            return callback(new Error('Test sent output to stderr: '+testError));
        }

        testOutput.split('\n').forEach(function(line) {
            // strip out any (XXms) as well as console formatting
            line = line.replace(/(\s+\(\d+ms\)|[^a-zA-Z]\[\d+m)/g, '').trim();
            // strip out stack traces
            line = line.replace(/^\s*at.*/, '');
            if (line) {
                rawOutputLines.push(line);
            }
        });

        callback(null, rawOutputLines);
    });
}
