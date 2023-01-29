# URL Shortener

1. Features
2. CQRS Pattern
3. API Docs
4. API Testing
5. API Development Life Cycle
6. Further Improvements

## Features

- Ability to submit long URL `https://really-awesome-long-url.com` to API.
- Receive short URL `https://short.com` in return.
- Short URL can then be shared around and should redirect to long URL.

## CQRS Pattern

Pattern implemented within REST API to handle read/write requests.

https://apisix.apache.org/blog/2022/09/23/build-event-driven-api/

CQRS stands for `Command and Query Responsibility Segregation`, a pattern that separates reads and writes into different models, using commands to update data, and queries to read data.

`query` and `upsert` (updates or creates) responsibilities are split (segregated) into different services, each with its own storage.

Technically, this can be implemented in HTTP so that the `Command API` is implemented exclusively with `POST routes` (The write side uses a schema that is optimized for updates), while the `Query API` is implemented exclusively with `GET routes` (The read side can use a schema that is optimized for queries)

## API Docs

## API Testing

## API Development Life Cycle

## Further Improvements

- URLs shortened can be `temporal` or `permanent` ones.
- `permanent` URLs need payment by authenticated users first.
- `temporal` URLs only last 24hs and can be created through a public endpoint.
- Task in background should remove `temporal` URLs from database after 24hs.
