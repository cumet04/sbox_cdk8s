import { Construct } from "constructs";
import { App, Chart } from "cdk8s";
import { WebService } from "./lib/web-service";

class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new WebService(this, "hello", {
      image: "paulbouwer/hello-kubernetes:1.7",
      replicas: 2,
    });
    new WebService(this, "ghost", { image: "ghost", containerPort: 2368 });
  }
}

const app = new App();
new MyChart(app, "sbox_cdk8s");
app.synth();
