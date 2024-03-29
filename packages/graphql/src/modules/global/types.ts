import { gql } from "apollo-server";

export default gql`
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type MessageOutput {
    message: String!
  }

  type Query {
    health: MessageOutput
  }
`;
