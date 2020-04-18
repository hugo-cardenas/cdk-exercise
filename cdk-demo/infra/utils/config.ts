export const organizations = ["GalacticEmpire" as const];
export type Organization = typeof organizations[number]

const applications = ["DeathStar" as const, "DeathStarServerless" as const]
export type ApplicationId = typeof applications[number]

export interface ApplicationConfig {
  path: string
}
export const applicationConfigs: {
  [key in ApplicationId]: ApplicationConfig
} = {
  DeathStar: {
    path: "cdk-demo/death-star"
  },
  DeathStarServerless: {
    path: "cdk-demo/death-star-serverless"
  }
};

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];

export const commonStackName = (organization: Organization, stackName: string) =>
  `${organization}-${stackName}`;

export const pipelineName = (organization: Organization, appId: ApplicationId) =>
  `${organization}-Pipeline-${appId}`;

export const applicationStackName = (organization: Organization, appId: ApplicationId, stage: Stage) =>
  `${organization}-${appId}-${stage}`;
