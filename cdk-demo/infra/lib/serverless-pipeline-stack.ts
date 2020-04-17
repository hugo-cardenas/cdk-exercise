import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import { StackProps } from "@aws-cdk/core";
import { ApplicationId } from "../utils/config";

const githubTokenSecretId = "github-oauth-token"

export interface PipelineStackProps extends StackProps {
  appId: ApplicationId;
}

export class ServerlessPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);    

    const build = new codebuild.PipelineProject(this, "Build", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: "npm install -D",
          },
          build: {
            commands: "npm test",
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    const sourceOutput = new codepipeline.Artifact();

    new codepipeline.Pipeline(this, `Pipeline`, {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: "GithubSource",
              output: sourceOutput,
              owner: "",
              repo: "",
              oauthToken: cdk.SecretValue.secretsManager(githubTokenSecretId)
            }),
          ],
        },
        {
          stageName: "BuildAndTest",
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: "Build",
              input: sourceOutput,
              project: build,
            }),
          ],
        },
        // {
        //   stageName: "DeployToStaging",
        //   actions: [],
        // },
      ],
    });
  }
}
