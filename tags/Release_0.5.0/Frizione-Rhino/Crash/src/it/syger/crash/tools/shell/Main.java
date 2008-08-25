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

package it.syger.crash.tools.shell;

import java.io.InputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.mozilla.javascript.tools.shell.Global;
import org.mozilla.javascript.tools.ToolErrorReporter;

/**
 * The shell program.
 *
 * Can execute scripts interactively or in batch mode at the command line.
 * An example of controlling the JavaScript engine.
 */
public class Main extends org.mozilla.javascript.tools.shell.Main
{

    /**
     * Main entry point.
     *
     * Process arguments as would a normal Java program. Also
     * create a new Context and associate it with the current thread.
     * Then set up the execution environment and begin to
     * execute scripts.
     */
    public static void main(String args[]) {
        try {
            if (Boolean.getBoolean("rhino.use_java_policy_security")) {
                initJavaPolicySecuritySupport();
            }
        } catch (SecurityException ex) {
            ex.printStackTrace(System.err);
        }

        int result = exec(args);
        if (result != 0) {
            System.exit(result);
        }
    }

    /**
     *  Execute the given arguments, but don't System.exit at the end.
     */
    public static int exec(String origArgs[])
    {
        errorReporter = new ToolErrorReporter(false, global.getErr());
        shellContextFactory.setErrorReporter(errorReporter);
        String[] args = processOptions(origArgs);

        if (processStdin) {
            InputStream stream = null;
            try {
                String jarUrl = global.getClass().getResource("/it/syger/crash/tools/shell/Main.class").toString();
                int index = jarUrl.indexOf('!');
                jarUrl = jarUrl.substring(0, index + 1);
                stream = new URL(jarUrl + "/META-INF/MANIFEST.MF").openStream();

                // java.util.jar.Manifest just doesn't work for me...
                java.io.BufferedReader r = new java.io.BufferedReader(new java.io.InputStreamReader(stream, "UTF-8"));
                String line = null;
                while ((line = r.readLine()) != null) {
                    if (line.startsWith("Main-Script:")) {
                        line = line.substring(12).trim();
                        processStdin = false;
                        fileList.addElement(jarUrl + line);
                    }
                }
                r.close();
                stream = null;
            }
            catch (MalformedURLException mue) {
                // do nothing
            }
            catch (IOException ioe) {
                if (stream != null) {
                    try {
                        stream.close();
                    }
                    catch (IOException ignore) { /* ignored */ }
                }
            }

            if (processStdin) {
                fileList.addElement(null);
            }
        }

        if (!global.isInitialized()) {
            global.init(shellContextFactory);
        }
        IProxy iproxy = new IProxy(IProxy.PROCESS_FILES, args);
        shellContextFactory.call(iproxy);

        return exitCode;
    }
}