export const organizations = ["GalacticEmpire" as const];
export type Organization = typeof organizations[number];

const applications = ["DeathStar" as const, "DeathStarServerless" as const];
export type ApplicationId = typeof applications[number];

export interface ApplicationConfig {
  path: string;
}
export const applicationConfigs: {
  [key in ApplicationId]: ApplicationConfig;
} = {
  DeathStar: {
    path: "death-star",
  },
  DeathStarServerless: {
    path: "death-star-serverless",
  },
};
