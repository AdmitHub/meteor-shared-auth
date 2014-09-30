Meteor.startup(function() {
  Router.map(function() {
    this.route("shared-auth-frame", {
      template: 'sharedAuthFrame',
      layout: 'emptyLayout',
      path: "/shared-auth-frame",
      waitOn: function() {
        return {ready: function() { return !Meteor.loggingIn(); }}
      }
    });
  });
});
