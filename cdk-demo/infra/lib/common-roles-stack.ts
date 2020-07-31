import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { Organization } from "../../common/applications";

interface CommonRolesStackProps extends cdk.StackProps {
  organization: Organization;
}

export class CommonRolesStack extends cdk.Stack {
  readonly codeBuildRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, props: CommonRolesStackProps) {
    super(scope, id, props);
    const { organization } = props;
    const resourceName = (name: string) => `${organization}-${name}`;

    this.codeBuildRole = new iam.Role(this, resourceName("CodeBuildRole"), {
      roleName: resourceName("CodeBuildRole"),
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });
  }
}
