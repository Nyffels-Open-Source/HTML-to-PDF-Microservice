# HTML to PDF Docker swagger server

A docker server with Swagger API implemented to convert HTML code to a PDF document.

## Installation

use "docker run -d --restart unless-stopped nyffelsit/html-to-pdf" to start the server. 

Possible environment variables are: 
- CODE = The api key that can be used, if left empty, the server will generate a different one on every startup. 
- PORT = The port that the application has to use.

## Usage

For the swagger documentation go to http://<ip>/documentation. 

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)