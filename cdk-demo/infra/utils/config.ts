import { Organization, ApplicationId } from "../../common/applications";

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];

export const commonStackName = (
  organization: Organization,
  stackName: string
) => `${organization}-${stackName}`;

export const pipelineName = (
  organization: Organization,
  appId: ApplicationId
) => `${organization}-Pipeline-${appId}`;

export const applicationStackName = (
  organization: Organization,
  appId: ApplicationId,
  stage: Stage
) => `${organization}-${appId}-${stage}`;
