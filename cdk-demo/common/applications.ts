export const organizations = ["MyOrganization" as const];
export type Organization = typeof organizations[number];

const applications = [
  "MyContainerApplication" as const,
  "MyServerlessApplication" as const,
];
export type ApplicationId = typeof applications[number];

export interface ApplicationConfig {
  path: string;
}
export const applicationConfigs: {
  [key in ApplicationId]: ApplicationConfig;
} = {
  MyContainerApplication: {
    path: "my-container-application",
  },
  MyServerlessApplication: {
    path: "my-serverless-application",
  },
};

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];
