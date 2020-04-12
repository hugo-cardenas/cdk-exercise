import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Construct } from "@aws-cdk/core";

interface Props {
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "Hits", {
      partitionKey: {
        name: "path",
        type: dynamodb.AttributeType.STRING,
      },
    });

    this.handler = new lambda.Function(this, "HitCounterHandler", {
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName,
      },
      handler: "hit-counter.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    this.table.grantWriteData(this.handler);

    props.downstream.grantInvoke(this.handler);
  }
}
