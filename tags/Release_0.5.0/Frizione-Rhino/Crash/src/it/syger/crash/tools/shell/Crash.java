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

import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.ScriptableObject;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.jar.JarFile;

/**
 * The Crash JavaScript object.
 */
public class Crash extends ScriptableObject {

    static final long serialVersionUID = -330727378460177066L;

    public static void defineClass(ScriptableObject scope) {
        try {
            ScriptableObject.defineClass(scope, Crash.class);
        } catch (Exception e) {
            throw new Error(e.getMessage());
        }
    }

    public String getClassName() {
        return "Crash";
    }

    public Crash() {
    }

    public Crash(ScriptableObject scope) {
        setParentScope(scope);
        Object ctor = ScriptRuntime.getTopLevelProp(scope, "Crash");
        if (ctor != null && ctor instanceof Scriptable) {
            Scriptable s = (Scriptable)ctor;
            setPrototype((Scriptable)s.get("prototype", s));
        }
        String jarUrl = getClass().getResource("/it/syger/crash/tools/shell/Crash.class").toString();
        int index = jarUrl.indexOf('!');
        jarUrl = jarUrl.substring(0, index + 1);
        defineProperty("root", jarUrl, ScriptableObject.DONTENUM);
        try {
            URI jarUri = new URI(jarUrl.substring(4, jarUrl.length() - 1));
            JarFile jar = new JarFile(new File(jarUri));
            defineProperty("jar", jar, ScriptableObject.DONTENUM);
        }
        catch (URISyntaxException use) { /* do nothing */ }
        catch (IOException ioe) { /* do nothing */ }
    }
}