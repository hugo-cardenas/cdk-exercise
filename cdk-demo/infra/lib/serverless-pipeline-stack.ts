import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as iam from "@aws-cdk/aws-iam";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
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
}

const buildImage = codebuild.LinuxBuildImage.STANDARD_2_0;

export class ServerlessPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const { codeBuildRoleArn, githubTokenSecret } = props;

    const sourceOutput = new codepipeline.Artifact();

    const codeBuildRole = iam.Role.fromRoleArn(
      this,
      "CodeBuildRole",
      codeBuildRoleArn
    );

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
          stageName: "BuildAndTest",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "BuildAndTest",
              input: sourceOutput,
              project: createBuildAndTestProject(this, props),
            }),
          ],
        },
        {
          stageName: "DeployToStaging",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "DeployToStaging",
              input: sourceOutput,
              project: createDeployServerProject(
                this,
                props,
                codeBuildRole,
                "staging"
              ),
            }),
          ],
        },
      ],
    });
  }
}

const createBuildAndTestProject = (
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
            // cdk-demo should disappear for the real project
            `cd "$CODEBUILD_SRC_DIR/cdk-demo/${appConfig.paths.server}"`,
            "npm ci",
            "npm test",
            // cdk-demo should disappear for the real project
            // `cd "$CODEBUILD_SRC_DIR/cdk-demo/${appConfig.paths.client}"`,
            // "npm ci",
            // "npm test",
            // "npm run build",
          ],
        },
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
            // This should disappear for the real project
            "cd cdk-demo",
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
