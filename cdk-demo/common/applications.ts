export const organizations = ["MyOrganization" as const];
export type Organization = typeof organizations[number];

const applications = [
  // "MyContainerApplication" as const,
  "MyServerlessApplication" as const,
];
export type ApplicationId = typeof applications[number];

export interface ApplicationConfig {
  paths: {
    client: string;
    clientBuild: string;
    server: string;
  };
}
export const applicationConfigs: {
  [key in ApplicationId]: ApplicationConfig;
} = {
  MyServerlessApplication: {
    paths: {
      client: "my-serverless-application/client",
      clientBuild: "my-serverless-application/client/build",
      server: "my-serverless-application/server",
    },
  },
};

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];
