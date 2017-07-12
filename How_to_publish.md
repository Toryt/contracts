    jand@sovereign:contracts>npm adduser --scope=@toryt
    Username: jandockx
    Password: 
    Email: (this IS public) jandockx@gmail.com
    Logged in as jandockx to scope @toryt on https://registry.npmjs.org/.
    jand@sovereign:contracts>npm publish --access public
    + @toryt/contracts-ii@1.0.0
    jand@sovereign:contracts>npm config set scope toryt


yarn publish does not seem to work. Does it have a problem with npm scopes?

    jand@sovereign:contracts>yarn logout
    yarn logout v0.24.6
    success Cleared login credentials.
    ✨  Done in 0.03s.
    jand@sovereign:contracts>yarn login
    yarn login v0.24.6
    question npm username: jandockx
    question npm email: jandockx@gmail.com
    ✨  Done in 18.70s.
    jand@sovereign:contracts>yarn publish --access public
    yarn publish v0.24.6
    [1/4] Bumping version...
    info Current version: 3.0.0
    question New version: 3.0.0
    [2/4] Logging in...
    [3/4] Publishing...
