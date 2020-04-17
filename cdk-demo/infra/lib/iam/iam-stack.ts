import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { awsUsers } from "./aws-users";
import { Stack } from "@aws-cdk/core";
import { randomString } from "../../utils/string";

export class IamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const developerUserGroup = new iam.Group(this, "DeveloperUserGroup");

    awsUsers.map((user) => {
      const userName = `DeveloperUser-${user.name}`
      const userResourceId = (resourceId: string) => `${resourceId}-${userName}`

      // This generates the default value only on the 1st run if the Parameter hasn't been created yet
      const consolePassword = new cdk.CfnParameter(this, userResourceId("ConsolePassword"), {
        default: randomString(20)
      })
      const cfnUser = new iam.CfnUser(this, userName, {
        userName,
        groups: [developerUserGroup.groupName],
        loginProfile: {
          password: consolePassword.valueAsString,
          passwordResetRequired: true,
        },
        policies: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["sts:AssumeRole"],
            resources: [adminRole.roleArn],
          })
        ]
      });

      // Output the AWS Console password on the CLI
      new cdk.CfnOutput(this, userResourceId("ConsolePassword"), {
        value: consolePassword.valueAsString,
      });

      // Create an Access Key+Secret for programmatic access and output the Secret on the CLI
      const key = new iam.CfnAccessKey(this, userResourceId("AccessKey"), {
        userName: cfnUser.userName!,
      });
      key.addDependsOn(cfnUser);
      new cdk.CfnOutput(this, userResourceId("AccessKeyOutput"), {
        value: key.attrSecretAccessKey,
      });
    });

    const adminRole = new iam.Role(this, "AdminRole", {
      // TODO This should be restricted with a Network whitelist?
      assumedBy: new iam.AccountPrincipal(Stack.of(this).account),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    developerUserGroup.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: [adminRole.roleArn],
      })
    );
  }
}
