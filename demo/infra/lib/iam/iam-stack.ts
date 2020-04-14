import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { users } from "./users";

export class IamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const group = new iam.Group(this, "DeveloperUserGroup");

    const iamUsers = users.map(
      (user) => new iam.User(this, `DeveloperUser-${user.name}`)
    );

    iamUsers.forEach((iamUser) => group.addUser(iamUser));

    const ecrAccessPolicy = new iam.ManagedPolicy(
      this,
      "EcrDeveloperAccess",
      {}
    );

    group.addManagedPolicy(
      new iam.ManagedPolicy(this, "AdministratorAccess", {})
    );
  }
}
