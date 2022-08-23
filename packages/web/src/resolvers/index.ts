import {
  ApolloClient as Client,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export function buildClient(uri: string) {
  const authLink = setContext((_, { headers }) => {
    // TODO: Add authentication layer to the api later on
    return {
      headers: { ...headers },
    };
  });

  const httpLink = authLink.concat(
    createHttpLink({
      uri: uri || "http://localhost:4000/",
    })
  );

  return new Client({
    link: httpLink,
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
}
