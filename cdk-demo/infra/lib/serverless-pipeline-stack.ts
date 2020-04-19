import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { StackProps } from "@aws-cdk/core";
import { ApplicationId, ApplicationConfig } from "../utils/config";

export interface PipelineStackProps extends StackProps {
  appId: ApplicationId;
  appConfig: ApplicationConfig;
  githubTokenSecret: secretsmanager.Secret;
}

export class ServerlessPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const { githubTokenSecret } = props;

    const sourceOutput = new codepipeline.Artifact();

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
        // {
        //   stageName: "DeployToStaging",
        //   actions: [
        //     new codepipelineActions.CodeBuildAction({
        //       actionName: "Build",
        //       input: sourceOutput,
        //       project: createDeployToStagingProject(this, props),
        //     }),
        //   ],
        // },
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
            "npm install -D",
            "npm run eslint:check",
            "npm run prettier:check",
            `cd ${appConfig.path}`,
            "npm install -D",
            "npm test",
          ],
        },
      },
    }),
    environment: {
      buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
    },
  });

// const createDeployToStagingProject = (
//   scope: cdk.Construct,
//   { appConfig }: PipelineStackProps
// ) =>
//   new codebuild.PipelineProject(scope, "DeployToStaging", {
//     buildSpec: codebuild.BuildSpec.fromObject({
//       version: "0.2",
//       phases: {
//         build: {
//           commands: `cd ${appConfig.path} && serverless deploy --stage staging`,
//         },
//       },
//     }),
//     environment: {
//       buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
//     },
//   });
