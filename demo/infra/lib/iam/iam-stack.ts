import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { users } from "./users";
import { Stack } from "@aws-cdk/core";

export class IamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const developerUserGroup = new iam.Group(this, "DeveloperUserGroup");
    users.map(
      (user) => {
        const consolePassword = new cdk.CfnParameter(this, `ConsolePassword-${user.name}`)
        const cfnUser = new iam.CfnUser(this, `DeveloperUser-${user.name}`, {
          userName: `DeveloperUser-${user.name}`,
          groups: [developerUserGroup.groupName],
          loginProfile: {
            password: consolePassword.valueAsString,
            passwordResetRequired: true
          }
        })
        const key = new iam.CfnAccessKey(this, `AccessKey-${cfnUser.userName}`, { userName: cfnUser.userName! });
        key.addDependsOn(cfnUser)
        new cdk.CfnOutput(this, `AccessKeyOutput-${cfnUser.userName}`, {
          value: key.attrSecretAccessKey
        })
      }
    );

    const adminRole = new iam.Role(this, "AdminRole", {
      // TODO This should be restricted with a Network whitelist?
      assumedBy: new iam.AccountPrincipal(Stack.of(this).account),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    developerUserGroup.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "sts:AssumeRole"
      ],
      resources: [
        adminRole.roleArn
      ]
    }))
  }
}
