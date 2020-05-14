import { Construct, Node } from "constructs";
import { Deployment, Service, Ingress, IntOrString } from "../imports/k8s";

export interface WebServiceOptions {
  /**
   * The Docker image to use for this service.
   */
  readonly image: string;

  /**
   * Number of replicas.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Internal port.
   *
   * @default 8080
   */
  readonly containerPort?: number;

  /**
   * Domain of virtual host.
   */
  readonly hostname: string;
}

export class WebService extends Construct {
  constructor(scope: Construct, ns: string, options: WebServiceOptions) {
    super(scope, ns);

    const port = 80;
    const containerPort = options.containerPort || 8080;
    const label = { app: Node.of(this).uniqueId };

    const service = new Service(this, "service", {
      spec: {
        ports: [
          {
            port,
            targetPort: IntOrString.fromNumber(containerPort),
          },
        ],
        selector: label,
      },
    });

    new Deployment(this, "deployment", {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: "app",
                image: options.image,
                ports: [{ containerPort }],
              },
            ],
          },
        },
      },
    });

    new Ingress(this, "ingress", {
      spec: {
        rules: [
          {
            host: options.hostname,
            http: {
              paths: [
                {
                  path: "/",
                  backend: {
                    serviceName: service.name,
                    servicePort: port,
                  },
                },
              ],
            },
          },
        ],
      },
    });
  }
}
