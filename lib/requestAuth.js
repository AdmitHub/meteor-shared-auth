// This code runs in the parent (the top-level site) which embeds iframes to
// child sites with which it is sharing auth state.

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
    var childFrames = [];
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
      childFrames.push(iframe.contentWindow);
    });

    window.addEventListener("message", function(event) {
      if (_.contains(domains, event.origin)) {
        if (event.data.hasOwnProperty("Meteor.loginToken")) {
          clearInterval(pollIntervals[event.origin]);
          // We don't accept logout here.  Logout is "push" based, so that it's
          // always an active session that will request that we logout, rather
          // than an un-logged-in site we're not active on informing us that
          // we're not logged in there.
          if (event.data["Meteor.loginToken"]) {
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
    
    // Log frames out if we change users or log out.  We can't do this as a
    // localStorage listener because those only work on different pages.
    var curUserId = localStorage.getItem("Meteor.userId");
    Deps.autorun(function() {
      var newUserId = Meteor.userId();
      //console.log("parent auth changed", newUserId);
      if (curUserId && (newUserId !== curUserId)) {
        //console.log("parent requesting children logout");
        _.each(childFrames, function(cw) {
          cw.postMessage("requestLogout", "*");
        });
      }
      curUserId = newUserId;
    });
  });
}
