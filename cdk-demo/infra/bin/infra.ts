#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ApplicationStack } from "../lib/application-stack";
import { PipelineStack } from "../lib/pipeline-stack";
import { resolveAppStackName, resolveCommonStackName } from "../utils/config";
import { IamStack } from "../lib/iam/iam-stack";

const app = new cdk.App();

new IamStack(app, resolveCommonStackName("IAM"));
new PipelineStack(app, resolveCommonStackName("Pipeline"));
new ApplicationStack(app, resolveAppStackName("DeathStar", "staging"));
