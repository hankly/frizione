/*
 * Minor modification to remove .svn directories from the list.
 */

/**
  * lists all applications in appdir.
  * for active apps use this.getApplications() = helma.main.Server.getApplications()
  */
function getAllApplications() {
    app.debug("Manage.getAllApplications");
    var appsDir = this.getAppsHome();
    var dir = appsDir.listFiles();
    var arr = new Array();
    var seen = {};
    // first check apps directory for apps directories
    if (dir) {
        for (var i = 0; i < dir.length; i++) {
            var name = dir[i].name.toLowerCase();
            if (dir[i].isDirectory() && name != "cvs" && name != ".svn") {
                arr[arr.length] = this.getApp(dir[i].name);
                seen[dir[i].name] = true;
            }
        }
    }
    // then check entries in apps.properties for apps not currently running
    var props = wrapJavaMap(root.getAppsProperties(null));
    for (var i in props) {
        if (i.indexOf(".") < 0 && !seen[i] && !root.getApplication(i)) {
            arr[arr.length] = this.getApp(i);
        }
    }
    return arr;
}
