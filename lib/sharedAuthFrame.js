if (Meteor.isClient) {
  Meteor.startup(function() {
    Template.sharedAuthFrame.helpers({
      "sharedAuthFrame": function() {
          var parentOrigin = null;
          var parentSource = null;

          if (!(Meteor.settings &&
                Meteor.settings.public &&
                Meteor.settings.public.sharedAuthDomains &&
                Meteor.settings.public.sharedAuthDomains.length)) {
            // No domain settings => no worky
            throw new Error("shared-auth: Meteor.settings.public.sharedAuthDomains on " + window.location.host + " is not defined.");
          }

          // Tell the parent about our login state.
          function notifyParent() {
              if (!parentOrigin || !parentSource) {
                return;
              }
              parentSource.postMessage({
                  "Meteor.loginTokenExpires": localStorage.getItem("Meteor.loginTokenExpires"),
                  "Meteor.loginToken": localStorage.getItem("Meteor.loginToken"),
                  "Meteor.userId": localStorage.getItem("Meteor.userId")
              }, parentOrigin);
          }

          // The origin which this frame allows to request auth tokens from us.
          function onMessage(event) {
            // Ensure we are within allowed origins.
            var found = false;
            for (var i=0; i < Meteor.settings.public.sharedAuthDomains.length; i++) {
              if (Meteor.settings.public.sharedAuthDomains[i] === event.origin) {
                found = true;
                break;
              }
            }
            if (!found) {
              if (event.data === "requestAuth") {
                console.log("sharedAuthFrame refusing to share auth with " + event.origin + ", which is not in Meteor.settings.public.sharedAuthDomains:", Meteor.settings.public.sharedAuthDomains);
              }
              return;
            }

            // Respond to the message with auth tokens.
            if (event.data === "requestAuth") {
              // We only set these after we're sure event.origin is in sharedAuthDomains.
              parentOrigin = event.origin;
              parentSource = event.source;
              notifyParent();
            }
          }
          // Update parent if storage changes.
          function onStorageChange(event) {
            if (event.key === "Meteor.loginToken" || 
                event.key === "Meteor.loginTokenExpires" ||
                event.key === "Meteor.userId") {
              notifyParent();
            }
          }
          window.addEventListener("storage", onStorageChange, false);
          window.addEventListener("message", onMessage, false);
        }
    });
  });
}
