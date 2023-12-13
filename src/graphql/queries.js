/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getState = /* GraphQL */ `
  query GetState {
    getState {
      id
      firstName
      lastName
      currentState
      currentStartTimestamp
      agentARN
      previousState
      previousStartTimeStamp
      eventType
      __typename
    }
  }
`;
export const getProfile = /* GraphQL */ `
  query GetProfile($id: String) {
    getProfile(id: $id) {
      id
      agentStatus {
        id
        name
        color
        __typename
      }
      __typename {
        id
        __typename
      }
      __typename
    }
  }
`;
