// Import Apollo Azure integration library
import { ApolloServer, gql } from "apollo-server-azure-functions";
import { CosmosClient } from "@azure/cosmos";

const databaseName = "graphql";
const containerName = "items";

// Create connection to Cosmo DB
// Connection string is read from local.settings.json file
const client = new CosmosClient(process.env.CosmosKey);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int,
    first_name: String
    last_name: String,
    email: String
  },
type Query {
    user(id: Int!): User,
    users: [User]
  }
`;

const resolvers = {
    Query: {
      user: getUser,
      users: getAllUser
    }
  };

    async function getUser (_, { id }) {
    let query = "SELECT * FROM c WHERE c.id = @userId";
    let params = [{ name: "@userId", value: id.toString() }];
  
    let { resources: items } = await client.database(databaseName).container(containerName)
      .items.query({ query: query, parameters: params }).fetchAll();
  
    if (items.length > 0) {
      return items[0];
    }
  
    return null;
  };
  
  async function getAllUser() {
    let { resources: items } = await client.database(databaseName).container(containerName)
      .items.query({ query: "SELECT * from c" }).fetchAll();
    return items;
  };

const server = new ApolloServer({ typeDefs, resolvers });
export default server.createHandler();