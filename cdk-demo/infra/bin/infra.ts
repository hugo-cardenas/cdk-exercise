#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
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
import { IamStack } from "../lib/iam/iam-stack";
import { ServerlessPipelineStack } from "../lib/serverless-pipeline-stack";
import { CommonRolesStack } from "../lib/common-roles-stack";
import { CommonSecretsStack } from "../lib/common-secrets-stack";
import { ServerlessApplicationStack } from "../lib/serverless-application-stack";

const organization: Organization = "MyOrganizationFoo";
const applicationId: ApplicationId = "MyServerlessApplication";

const app = new cdk.App();

const commonSecretsStack = new CommonSecretsStack(
  app,
  commonStackName(organization, "CommonSecrets"),
  {
    organization,
  }
);

const commonRolesStack = new CommonRolesStack(
  app,
  commonStackName(organization, "CommonRoles"),
  {
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
  githubTokenSecret: commonSecretsStack.githubTokenSecret,
  codeBuildRoleArn: commonRolesStack.codeBuildRole.roleArn,
});
