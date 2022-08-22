/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable default-case */
import {
  ApolloClient as Client,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_API_URI || "http://localhost:4000/",
});

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  // TODO: Add authentication layer to the api later on
  return {
    headers: {
      ...headers,
    },
  };
});

export const client = new Client({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          launchpad_projects: {
            keyArgs: false,
            merge(existing, incoming) {
              return {
                ...incoming,
                data: [...(existing?.data || []), ...incoming.data],
              };
            },
          },
        },
      },
    },
  }),
});
