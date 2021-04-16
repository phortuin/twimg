# T/W/I/M/G

> Browse twitter home timeline by media only

One-page website that renders tweets from your home timeline that have media attached (image, video). Images shown in a large format, easy to right-click-save.

## Development
Create and configure `.env` file, install dependencies and run using `vercel dev`:

```bash
$ cp .env.example .env
$ npm i
$ npm run dev:vercel
```

### Notes
- Environment variables are gained by [creating a Twitter app](https://developer.twitter.com/en/apps/create) with your Twitter developer account.
- Read [Vercel docs](https://vercel.com/docs/cli#commands/secrets) on creating secrets/environment variables to get this app to run on your own Vercel account.
- Twitter limits user requests to 15 per 15 minutes. 200 tweets can be retrieved from the API at a time, with a max of 800. The ‘media only’-filtering done in this app will reduce that number further.
- Using your Twitter consumer key & secret as an environment variable is generally a bad idea; use at your own peril.
- Twitter tokens are stored in an [UpStash Redis Database](https://www.upstash.com/) with TLS encryption.
- No CSRF token because cookie policy is `HttpOnly; Secure; SameSite=Strict`.

### Tech
- Uses [Vercel](https://vercel.com/) (formerly Zeit Now) serverless functions
- Templating with Mustache
- That’s about it

## Todo
- [ ] Twitter oAuth login instead of consumer tokens
- [ ] Dropbox oAuth login instead of access token
- [x] Pretty styling & mobile first design
- [x] Button to save images directly to Dropbox
- [x] Play videos inline

## License
[MIT](license) © [Anne Fortuin](https://phortuin.nl/)


https://api.slack.com/authentication/best-practices
https://medium.com/@d.silvas/how-to-implement-csrf-protection-on-a-jwt-based-app-node-csurf-angular-bb90af2a9efd
https://en.wikipedia.org/wiki/Cross-site_request_forgery#Prevention
