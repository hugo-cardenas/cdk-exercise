#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { Environment } from "@aws-cdk/core";
import {
  commonStackName,
  pipelineName,
  applicationStackName,
} from "../utils/config";
import {
  applicationConfigs,
  Organization,
  ApplicationId,
  Stage,
} from "../../common/applications";
import { Region } from "../../common/aws";
import { IamStack } from "../lib/iam/iam-stack";
import { ServerlessPipelineStack } from "../lib/serverless-pipeline-stack";
import { CommonRolesStack } from "../lib/common-roles-stack";
import { CommonSecretsStack } from "../lib/common-secrets-stack";
import { ServerlessApplicationStack } from "../lib/serverless-application-stack";

const region: Region = "eu-central-1";

const env: Environment = {
  account: "260998989604",
  region,
};

const organization: Organization = "MyOrganizationFoo";
const applicationId: ApplicationId = "MyServerlessApplication";

const app = new cdk.App();

const commonSecretsStack = new CommonSecretsStack(
  app,
  commonStackName(organization, "CommonSecrets"),
  {
    env,
    organization,
  }
);

const commonRolesStack = new CommonRolesStack(
  app,
  commonStackName(organization, "CommonRoles"),
  {
    env,
    organization,
  }
);

new IamStack(app, commonStackName(organization, "IAM"));

const createApplicationStack = (stage: Stage) =>
  new ServerlessApplicationStack(
    app,
    applicationStackName(organization, applicationId, stage),
    {
      appId: applicationId,
      applicationConfig: applicationConfigs[applicationId],
      env,
      organization,
      stage,
    }
  );

const applicationStacks = {
  staging: createApplicationStack("staging"),
  production: createApplicationStack("production"),
};

new ServerlessPipelineStack(app, pipelineName(organization, applicationId), {
  appId: applicationId,
  appConfig: applicationConfigs[applicationId],
  env,
  githubTokenSecret: commonSecretsStack.githubTokenSecret,
  codeBuildRoleArn: commonRolesStack.codeBuildRole.roleArn,
  applicationClientBuckets: {
    staging: applicationStacks.staging.applicationClientBucket,
    production: applicationStacks.production.applicationClientBucket,
  },
});
