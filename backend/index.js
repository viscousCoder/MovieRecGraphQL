const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { graphQLSchema } = require("./schema/graphqlSchema");
const { graphQLResolver } = require("./resolver/graphQLResolver");

const PORT = 6999;
async function startApolloServer() {
  const app = express();
  app.use(bodyParser.json());
  //   app.use(cors());
  app.use(cors({ origin: "*" }));

  const server = new ApolloServer({
    typeDefs: graphQLSchema,
    resolvers: graphQLResolver,
  });

  await server.start();
  app.use("/graphql", expressMiddleware(server));

  app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
}

startApolloServer();
