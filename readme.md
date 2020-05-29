# T/W/I/M/G

> Browse twitter home timeline by images only

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

### Tech
- Uses [Vercel](https://vercel.com/) (formerly Zeit Now) serverless functions
- Templating with Mustache
- That’s about it

## Todo
- [ ] oAuth login instead of Twitter consumer tokens
- [ ] Pretty styling & mobile first design
- [ ] Save images directly to Dropbox or other Cloud drive service 🤔
- [ ] Play videos inline

## License
[MIT](license) © [Anne Fortuin](https://phortuin.nl/)
