/*

 */

/*jslint evil: true */
/*global clutch, google */
/*members Gecko, Gears, IE, MobileSafari, Opera, WebKit,
    attachEvent, browser, clutch, gears, indexOf, match, opera, userAgent */

if (!this.clutch) {
    clutch = {};
}

/* Browser sniffing
 * Modified version of the Prototype library sniffer code */

clutch.browser =  {
  IE:           window && (!!(window.attachEvent && !window.opera)),
  Opera:        window && !!window.opera,
  WebKit:       navigator && navigator.userAgent.indexOf('AppleWebKit/') > -1,
  Gecko:        navigator && navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
  MobileSafari: navigator && !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
  Gears:        google && !!google.gears
};