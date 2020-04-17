export const organization = "GalacticEmpire";

export const applications = ["DeathStar" as const, "DeathStarServerless"];
export type ApplicationId = typeof applications[number];

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];

export const resolveCommonStackName = (stackName: string) =>
  `${organization}-${stackName}`;

export const resolvePipelineName = (appId: ApplicationId) =>
  `${organization}-Pipeline-${appId}`;

export const resolveApplicationStackName = (appId: ApplicationId, stage: Stage) =>
  `${organization}-${appId}-${stage}`;
