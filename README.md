# URL Shortener

1. Features
2. API Docs
3. API Testing
4. API Development Life Cycle
5. Further Improvements

## Features

- Ability to submit long URL `https://really-awesome-long-url.com` to API.
- Receive short URL `https://short.com` in return.
- Short URL can then be shared around and should redirect to long URL.

## API Docs

## API Testing

## API Development Life Cycle

## Further Improvements

- URLs shortened can be `temporal` or `permanent` ones.
- `permanent` URLs need payment by authenticated users first.
- `temporal` URLs only last 24hs and can be created through a public endpoint.
- Task in background should remove `temporal` URLs from database after 24hs.
