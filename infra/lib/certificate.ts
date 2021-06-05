import { BaseNestedStack, Certificate, HostedZone } from '@badatt/infra-lib/build/dist';
import { Construct, NestedStackProps } from '@aws-cdk/core';

export interface CertificateProps extends NestedStackProps {
  readonly rootDomain: string;
  readonly prefix: string;
  readonly hostedZone?: HostedZone;
}

export class CertificateStack extends BaseNestedStack {
  public certificate: Certificate;
  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id, props);
    this.certificate = new Certificate(this, 'Certificate', {
      prefix: props.prefix,
      rootDomain: props.rootDomain,
      hostedZone: props.hostedZone?.zone,
      validate: true,
    });
  }
}
