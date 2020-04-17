#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ApplicationStack } from "../lib/application-stack";
import { PipelineStack } from "../lib/pipeline-stack";
import { resolveApplicationStackName, resolveCommonStackName, resolvePipelineName } from "../utils/config";
import { IamStack } from "../lib/iam/iam-stack";
import { ServerlessPipelineStack } from "../lib/serverless-pipeline-stack";

const app = new cdk.App();

new IamStack(app, resolveCommonStackName("IAM"));
new PipelineStack(app, resolveCommonStackName("Pipeline"));
new ApplicationStack(app, resolveApplicationStackName("DeathStar", "staging"));

new ServerlessPipelineStack(app, resolvePipelineName("DeathStarServerless"), { appId: "DeathStarServerless" })
