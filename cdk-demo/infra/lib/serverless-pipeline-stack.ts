import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as iam from "@aws-cdk/aws-iam";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as s3 from "@aws-cdk/aws-s3";
import { StackProps } from "@aws-cdk/core";
import {
  ApplicationId,
  ApplicationConfig,
  Stage,
} from "../../common/applications";
import { firstToUpperCase } from "../../common/utils";

export interface PipelineStackProps extends StackProps {
  appId: ApplicationId;
  appConfig: ApplicationConfig;
  githubTokenSecret: secretsmanager.Secret;
  // Using ARN instead of passing the Role object to avoid a cyclic reference error
  // Similar to https://github.com/aws/aws-cdk/issues/3732
  codeBuildRoleArn: string;
  applicationClientBuckets: ApplicationClientBuckets;
}

export interface ApplicationClientBuckets {
  staging: s3.Bucket;
  production: s3.Bucket;
}

const buildImage = codebuild.LinuxBuildImage.STANDARD_2_0;

export class ServerlessPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const {
      applicationClientBuckets,
      codeBuildRoleArn,
      githubTokenSecret,
    } = props;

    const sourceOutput = new codepipeline.Artifact();
    const clientBuildOutput = new codepipeline.Artifact();

    const codeBuildRole = iam.Role.fromRoleArn(
      this,
      "CodeBuildRole",
      codeBuildRoleArn
    );

    const deployActions = (stage: Stage) => [
      new codepipelineActions.S3DeployAction({
        actionName: `DeployClientTo${firstToUpperCase(stage)}`,
        input: clientBuildOutput,
        bucket: applicationClientBuckets[stage],
      }),
      new codepipelineActions.CodeBuildAction({
        actionName: `DeployServerTo${firstToUpperCase(stage)}`,
        input: sourceOutput,
        project: createDeployServerProject(this, props, codeBuildRole, stage),
      }),
    ];

    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: id,
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: "GithubSource",
              output: sourceOutput,
              owner: "hugo-cardenas",
              repo: "infra-exercises",
              oauthToken: githubTokenSecret.secretValue,
            }),
          ],
        },
        {
          stageName: "TestAndBuild",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "TestAndBuild",
              input: sourceOutput,
              outputs: [clientBuildOutput],
              project: createTestAndBuildProject(this, props),
            }),
          ],
        },
        {
          stageName: "DeployToStaging",
          actions: deployActions("staging"),
        },
        {
          stageName: "ApproveDeployToProduction",
          actions: [
            new codepipelineActions.ManualApprovalAction({
              actionName: "ApproveDeployToProduction",
            }),
          ],
        },
        {
          stageName: "DeployToProduction",
          actions: deployActions("production"),
        },
      ],
    });
  }
}

const createTestAndBuildProject = (
  scope: cdk.Construct,
  { appConfig }: PipelineStackProps
) =>
  new codebuild.PipelineProject(scope, "BuildAndTest", {
    buildSpec: codebuild.BuildSpec.fromObject({
      version: "0.2",
      phases: {
        build: {
          commands: [
            // This should disappear for the real project
            "cd cdk-demo",
            "npm ci",
            "npm run eslint:check",
            "npm run prettier:check",
            `cd "$CODEBUILD_SRC_DIR/${appConfig.paths.server}"`,
            "npm ci",
            "npm test",
            `cd "$CODEBUILD_SRC_DIR/${appConfig.paths.client}"`,
            "npm ci",
            "npm test",
            "npm run build",
          ],
        },
      },
      artifacts: {
        "base-directory": `$CODEBUILD_SRC_DIR/${appConfig.paths.clientBuild}`,
        files: ["**/*"],
      },
    }),
    environment: {
      buildImage,
    },
  });

const createDeployServerProject = (
  scope: cdk.Construct,
  { appConfig }: PipelineStackProps,
  codeBuildRole: iam.IRole,
  stage: Stage
) =>
  new codebuild.PipelineProject(scope, `DeployTo${firstToUpperCase(stage)}`, {
    buildSpec: codebuild.BuildSpec.fromObject({
      version: "0.2",
      phases: {
        build: {
          commands: [
            `cd ${appConfig.paths.server}`,
            "npm install -D",
            `npx serverless deploy --stage ${stage}`,
          ],
        },
      },
    }),
    role: codeBuildRole,
    environment: {
      buildImage,
    },
  });
