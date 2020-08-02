export const organizations = ["MyOrganizationFoo" as const];
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
      client: "cdk-demo/my-serverless-application/client",
      clientBuild: "cdk-demo/my-serverless-application/client/build",
      server: "cdk-demo/my-serverless-application/server",
    },
  },
};

export const stages = ["staging" as const, "production" as const];
export type Stage = typeof stages[number];
