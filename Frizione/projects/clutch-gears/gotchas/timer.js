function runner () {
    var timer = null;
    var localSetTimeout = null;
    var localClearTimeout = null;

    try {
        timer = google.gears.factory.create('beta.timer');
        localSetTimeout = timer.setTimeout;
        localClearTimeout = timer.clearTimeout;
    }
    catch (e) {
        localSetTimeout = window.setTimeout;
        localClearTimeout = window.clearTimeout;
    }

    var timerId = null;
    return {

        run: function () {
            timerId = localSetTimeout(this.timed, 10000); // boom
        },

        timed: function () {
            // never gets here
            localClearTimeout(timerId);
            alert("No bug here...");
        }
    };
}