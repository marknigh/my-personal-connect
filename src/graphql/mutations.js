/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addProfile = /* GraphQL */ `
  mutation AddProfile($ProfileInput: ProfileInput) {
    addProfile(ProfileInput: $ProfileInput) {
      agentStatus {
        color
        id
        name
        __typename
      }
      id
      __typename
    }
  }
`;
export const updateProfile = /* GraphQL */ `
  mutation UpdateProfile($ProfileInput: ProfileInput) {
    updateProfile(ProfileInput: $ProfileInput) {
      agentStatus {
        color
        id
        name
        __typename
      }
      id
      __typename
    }
  }
`;
export const createAgentState = /* GraphQL */ `
  mutation CreateAgentState($input: AgentStateInput) {
    createAgentState(input: $input) {
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
