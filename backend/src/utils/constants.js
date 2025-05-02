import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpecs = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drinks Nepal API",
      version: "1.0.0",
      description: "API documentation for Drinks Nepal Backend",
    },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
});
