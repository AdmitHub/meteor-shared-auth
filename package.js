Package.describe({
  summary: "Share login among separate domains.",
  version: "0.0.7",
  name: "admithub:shared-auth",
  git: "https://github.com/AdmitHub/meteor-shared-auth.git"
});

Package.onUse(function (api) {
  api.versionsFrom('0.9.2');
  api.use(['iron:router@1.0.3', 'templating'], 'client');
  api.add_files([
    'lib/routes.js',
    'lib/sharedAuthFrame.html',
    'lib/sharedAuthFrame.js',
    'lib/emptyLayout.html',
    'lib/requestAuth.js'
  ], 'client');
});
