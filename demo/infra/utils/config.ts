export const organization = "GalacticEmpire";

export const applications = ["DeathStar" as const];
export type ApplicationId = typeof applications[number];

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];

export const resolveCommonStackName = (stackName: string) =>
  `${organization}-${stackName}`;

export const resolveAppStackName = (appId: ApplicationId, stage: Stage) =>
  `${organization}-${appId}-${stage}`;
