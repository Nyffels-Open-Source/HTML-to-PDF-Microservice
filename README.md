# HTML to PDF Microservice

A Docker-based microservice that converts HTML to PDF (PDF/A-ready via separate post-processing). Built with Node.js, Puppeteer, Google Chrome, and Swagger UI.

## Features

- HTML to PDF rendering via headless Chrome
- Swagger UI available at `/docs`
- Supports output as base64 or file download
- Safe browser reuse across concurrent requests
- Full Docker build with TypeScript compilation
- Google Fonts included

## Installation (Docker)

```bash
docker run -d \
  -e PORT=8000 \
  -p 8000:8000 \
  --restart unless-stopped \
  nyffels/html-to-pdf
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT`   | Optional port the app runs on. Default: `8000`. |
| `PDF_RENDER_CONCURRENCY` | Maximum number of concurrent PDF render jobs. Default: `4`. |
| `PDF_RENDER_QUEUE_LIMIT` | Optional maximum number of queued render jobs before returning `503`. Unset by default, which keeps the queue internal and waits for capacity. |
| `PDF_RENDER_WAIT_LOG_THRESHOLD_MS` | Logs a warning when a request waits at least this long for a render slot. Default: `1000`. |
| `PUPPETEER_LAUNCH_TIMEOUT_MS` | Chromium launch timeout in milliseconds. Default: `60000`. |

## API Documentation

Once the container is running:

```text
http://<host>:8000/docs
```

Queue metrics are available at:

```text
http://<host>:8000/metrics
```

## Local Development

```bash
npm install
npm run build
docker compose up --build
```

Port 8000 is exposed by default.

## Notes

- The service accepts HTML content and renders it in Chromium.
- The public API does not expose Puppeteer's `path` option, so requests cannot write PDFs to the container filesystem.
- `POST /pdf/file` returns an `application/pdf` attachment response.

## Contributing

PRs are welcome. For larger changes, please open an issue first. Do not forget to update documentation or tests if applicable.

## License

[MIT](https://choosealicense.com/licenses/mit/)
