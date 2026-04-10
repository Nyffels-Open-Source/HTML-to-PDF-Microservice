const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(__dirname, '..', 'src', 'swagger.json');
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

function asScalarUnion(schema, description) {
  const nextSchema = {
    type: ['string', 'number'],
  };

  if (description) {
    nextSchema.description = description;
  }

  return nextSchema;
}

const pdfOptions = swagger.components?.schemas?.PdfOptions;
if (!pdfOptions?.properties) {
  throw new Error('Unable to find components.schemas.PdfOptions in swagger.json');
}

pdfOptions.properties.width = asScalarUnion(
  pdfOptions.properties.width,
  'Sets the width of paper. You can pass in a number or a string with a unit.',
);

pdfOptions.properties.height = asScalarUnion(
  pdfOptions.properties.height,
  'Sets the height of paper. You can pass in a number or a string with a unit.',
);

const margin = pdfOptions.properties.margin;
if (!margin?.properties) {
  throw new Error('Unable to find components.schemas.PdfOptions.properties.margin in swagger.json');
}

margin.properties.top = asScalarUnion(margin.properties.top);
margin.properties.bottom = asScalarUnion(margin.properties.bottom);
margin.properties.left = asScalarUnion(margin.properties.left);
margin.properties.right = asScalarUnion(margin.properties.right);

swagger.openapi = '3.1.0';

fs.writeFileSync(swaggerPath, `${JSON.stringify(swagger, null, '\t')}\n`);
