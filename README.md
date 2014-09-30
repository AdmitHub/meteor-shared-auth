## Meteor Shared Auth

For situations where you have *multiple meteor applications* running on
*separate domains* but which share the *same database*, this package allows you
to share the logged-in state among the applications -- e.g. if I log in to one,
I will be automatically logged in to the other.

All of the meteor applications must use Meteor.settings, and define the public
setting ``sharedAuthDomains``, e.g.:

    // settings.json
    {
        "public": {
            "sharedAuthDomains": ["http://example.com", "http://example2.com"]
        }
    }

Each application will attempt to share its logged-in (or logged out) state with
each of the listed domains.

### Install

Install with:

    meteor add admithub:shared-auth
