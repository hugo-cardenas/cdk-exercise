import * as cdk from "@aws-cdk/core";
import * as ecr from "@aws-cdk/aws-ecr";

export class PipelineStack extends cdk.Stack {
  readonly repository: ecr.Repository;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, "EcrRepository");
  }
}
