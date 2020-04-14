import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { users } from "./users";
import { Stack } from "@aws-cdk/core";

export class IamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const developerUserGroup = new iam.Group(this, "DeveloperUserGroup");
    const developerUsers = users.map(
      (user) => new iam.User(this, `DeveloperUser-${user.name}`)
    );
    developerUsers.forEach((iamUser) => developerUserGroup.addUser(iamUser));

    const adminRole = new iam.Role(this, "AdminRole", {
      // TODO This should be restricted with a Network whitelist?
      assumedBy: new iam.AccountPrincipal(Stack.of(this).account),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")]
    })

    // const ecrAccessPolicy = new iam.ManagedPolicy(
    //   this,
    //   "EcrDeveloperAccess",
    //   {}
    // );

    // developerUserGroup.addManagedPolicy(
    //   new iam.ManagedPolicy(this, "AdministratorAccess", {})
    // );
  }
}
