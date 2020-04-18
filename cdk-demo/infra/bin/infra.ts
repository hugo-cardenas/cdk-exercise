#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import {
  applicationConfigs,
  commonStackName,
  pipelineName,
  Organization,
  ApplicationId,
} from "../utils/config";
import { IamStack } from "../lib/iam/iam-stack";
import { ServerlessPipelineStack } from "../lib/serverless-pipeline-stack";
import { CommonSecretsStack } from "../lib/common-secrets-stack";

const organization: Organization = "GalacticEmpire";
const applicationId: ApplicationId = "DeathStarServerless"

const app = new cdk.App();

const commonSecretsStack = new CommonSecretsStack(
  app,
  commonStackName(organization, "CommonSecrets"),
  {
    organization,
  }
);

new IamStack(app, commonStackName(organization, "IAM"));

new ServerlessPipelineStack(
  app,
  pipelineName(organization, applicationId),
  {
    appId: applicationId,
    appConfig: applicationConfigs[applicationId],
    githubTokenSecret: commonSecretsStack.githubTokenSecret
  }
);
