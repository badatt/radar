import { BaseNestedStack, HostedZone } from '@badatt/infra-lib/build/dist';
import { Construct, NestedStackProps } from '@aws-cdk/core';

export interface HostedZoneProps extends NestedStackProps {
  readonly rootDomain: string;
}

export class HostedZoneStack extends BaseNestedStack {
  public hostedZone: HostedZone;
  constructor(scope: Construct, id: string, props: HostedZoneProps) {
    super(scope, id, props);
    this.hostedZone = new HostedZone(this, 'HostedZone', {
      rootDomain: props.rootDomain,
    });
  }
}
