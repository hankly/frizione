/*
Copyright (c) 2008 The Crash Team.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

print("Hello from Crash main...");
print("crash.root = " + crash.root);
print("Jar contents:");
var entries = crash.jar.entries();
var entry = null;
while (entries.hasMoreElements()) {
    entry = entries.nextElement();
    if (entry.isDirectory()) {
        print("  dir: " + entry.getName());
    }
    else {
        print(" file: " + entry.getName());
    }
}

// load the crash loader...
load(crash.root + "/crash/core/rhino/loader.js");

// unit test
crash.load("crash/core");
crash.load("crash/template");
crash.load("crash/third-party");
crash.load("crash/unit-test");
crash.load("crash/xml");

print("Running unit tests...");
eval(crash.st.load(crash.resource("test/all.test.js"), {}, "UTF-8", '<'));
var tests = runCrashTests();
var date = new Date().toUTCString();
tests.run();

var status = tests.check();
while (status.complete === false) {
    crash.timer.pause(100);
    status = tests.check();
}

var json = tests.summarise();
json.summary.date = date;
var result = JSON.stringify(json, null, "\t");

var data = {};
data.head = "./head.html";
data.body = "./body.html";
data.relative = "./"
data.document = crash.resource("crash/unit-test/html/document.html");
var html = crash.test.htmlReport(json, data);

var file = crash.file('unit-test.html');
file.writeText(html);
print("Unit test results written to: " + file.file);
quit();