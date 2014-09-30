if (Meteor.isClient) {
  // Add iframes for shared auth and set up CDM.
  Meteor.startup(function() {
    if (!(Meteor.settings &&
          Meteor.settings.public &&
          Meteor.settings.public.sharedAuthDomains)) {
      throw new Error("shared-auth: ``Meteor.settings.public.sharedAuthDomains`` is not defined on " + window.location.host + ".");
    }
    var domains = Meteor.settings.public.sharedAuthDomains;
    if (!domains) {
      return;
    }
    // Don't recurse!
    if (window.location.pathname === "/shared-auth-frame") {
      return;
    }
    // Find out our origin.  We can't use process.env.ROOT_URL on client.
    // Some day we'll get window.location.origin, but IE.
    var selfOrigin = window.location.protocol + "//" + window.location.host;
    domains = _.without(domains, selfOrigin);
    // Add auth frames.
    var pollIntervals = {};
    domains.forEach(function(domain) {
      var body = document.body; 
      var iframe = document.createElement("iframe");
      iframe.src = domain + "/shared-auth-frame";
      iframe.width = 0;
      iframe.height = 0;
      iframe.style.display = "none";
      body.appendChild(iframe);
      pollIntervals[domain] = setInterval(function() {
        iframe.contentWindow.postMessage("requestAuth", '*');
      }, 100);
    });

    window.addEventListener("message", function(event) {
      if (_.contains(domains, event.origin)) {
        if (event.data.hasOwnProperty("Meteor.loginToken")) {
          clearInterval(pollIntervals[event.origin]);
          // Detect logout
          if (!event.data["Meteor.loginToken"]) {
            Meteor.logout();
          } else {
            // Login
            localStorage.setItem("Meteor.loginTokenExpires",
                                 event.data["Meteor.loginTokenExpires"]);
            localStorage.setItem("Meteor.loginToken",
                                 event.data["Meteor.loginToken"]);
            localStorage.setItem("Meteor.userId",
                                 event.data["Meteor.userId"]);
          }
        }
      }
    }, false);
  });
}
