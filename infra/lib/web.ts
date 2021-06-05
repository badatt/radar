import { BaseNestedStack, Certificate, HostedZone, WebApp } from '@badatt/infra-lib/build/dist';
import { Construct, NestedStackProps } from '@aws-cdk/core';

export interface RadarWebStackProps extends NestedStackProps {
  readonly hostedZone: HostedZone;
  readonly certificate: Certificate;
  readonly siteUrl: string;
}

export class RadarWebStack extends BaseNestedStack {
  constructor(scope: Construct, id: string, props: RadarWebStackProps) {
    super(scope, id, props);

    const webApp = new WebApp(this, 'WebApp', {
      certificate: props.certificate.certificate,
      hostedZone: props.hostedZone.zone,
      siteUrl: props.siteUrl,
    });
  }
}
