# T/W/I/M/G

> Browse twitter home timeline by media only

### 🚧 Abandoned project. I no longer have a Twitter account, for obvious reasons

One-page website that renders tweets from your home timeline that have media attached (image, video). Images shown in a large format, easy to right-click-save or save to Dropbox.

## Development
Create and configure `.env` file, install dependencies and run using `vercel dev`:

```bash
$ cp .env.example .env
$ npm i
$ npm run dev:vercel
```

## Production

Deploy with Vercel. You can set environment variables in your Vercel app with the exact same keys as in the `.env` file.

### Notes
- Twitter consumer key/secret is gained by [creating a Twitter app](https://developer.twitter.com/en/apps/create) with your Twitter developer account.
- Dropbox tokens can be created in a [Dropbox app](https://www.dropbox.com/developers/apps).
- Sessions are stored in an [UpStash Redis Database](https://www.upstash.com/) with TLS encryption.
- Twitter limits user requests to 15 per 15 minutes. 200 tweets can be retrieved from the API at a time, with a max of 800. The ‘media only’-filtering done in this app will reduce that number further.

### Tech
- Runs on [Vercel](https://vercel.com/)
- Templating with Mustache
- That’s about it

## Todo
- [ ] Dropbox oAuth login instead of access token
- [ ] Saving image api endpoint should check for Accept header to return JSON or HTML
- [ ] Write proper unit tests for Dropbox instance
- [ ] Let error handling middleware handle Dropbox errors as well as Twitter
- [ ] Redis instance shouldn’t export initClient
- [ ] Refactor redis-instance to session manager
- [ ] Refactor cookie script and let session be an actual session cookie
- [ ] Update cookie expiry after succesful authentication
- [ ] Lazy loading of images
- [ ] Use smaller image assets for display, larger when saving

## License
[MIT](license)
