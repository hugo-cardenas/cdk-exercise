import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "./pipeline-stack";
import { stages } from "../utils/config";

export class ApplicationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}
