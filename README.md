# HTML to PDF Docker swagger server

A docker server with Swagger API implemented to convert HTML code to PDF document.

## Installation

use "docker run -d --restart unless-stopped nyffels/html-to-pdf" to start the server. All the configuration is done by environment variables. 

Possible environment variables are: 
- CODE = The api key that can be used, if left empty, the server will generate a different one on every startup. 
- PORT = This will set the port for the program. If left empty, port 80 will be used. 

## Usage

For the swagger documentation go to http://<ip>/documentation. 

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)