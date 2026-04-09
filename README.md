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

## API Documentation

Once the container is running:

```text
http://<host>:8000/docs
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
