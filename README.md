# HTML to PDF Microservice

A Docker-based microservice that converts HTML to PDF (PDF/A-ready via separate post-processing). Built with Node.js, Puppeteer (with Chrome), and Swagger UI.

## 🔧 Features

- HTML → PDF rendering via headless Chrome (Puppeteer)
- Swagger UI available at `/docs`
- Supports output as base64 or file
- Full Docker build (includes TypeScript build)
- Google Fonts included

## 🚀 Installation (Docker)

```bash
docker run -d \
  -p 8000:8000 \
  --restart unless-stopped \
  nyffels/html-to-pdf
```

### 📦 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT`   | (optional) Port the app runs on (default: 8000). |

## 📘 API Documentation

Once the container is running:

```
http://<host>:8000/docs
```

## 🧪 Local Development

```bash
docker compose up --build
```

Port 8000 is automatically exposed.

## 🤝 Contributing

PRs are welcome. For larger changes, please open an issue first. Don’t forget to update documentation or tests if applicable.

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)
