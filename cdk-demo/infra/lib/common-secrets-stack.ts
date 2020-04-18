import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { Organization } from "../utils/config";

interface CommonSecretsStackProps extends cdk.StackProps {
  organization: Organization;
}

export class CommonSecretsStack extends cdk.Stack {
  readonly githubTokenSecret: secretsmanager.Secret;

  constructor(scope: cdk.Construct, id: string, props: CommonSecretsStackProps) {
    super(scope, id, props);
    const { organization } = props
    const resourceName = (name: string) => `${organization}-${name}`

    this.githubTokenSecret = new secretsmanager.Secret(
      this,
      resourceName(`GithubTokenSecret`),
      {
        secretName: resourceName(`GithubTokenSecret`),
      }
    );
  }
}
