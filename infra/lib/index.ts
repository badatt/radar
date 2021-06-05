import { BaseStack } from '@badatt/infra-lib';
import { Construct, StackProps } from '@aws-cdk/core';
import { CertificateStack } from './certificate';
import { HostedZoneStack } from './hosted-zone';
import { RadarWebStack } from './web';

export class RadarAppStack extends BaseStack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const rootDomain = scope.node.tryGetContext('rootDomain');
    const radarWebPrefix = scope.node.tryGetContext('radarWebPrefix');

    const hostedZone = new HostedZoneStack(this, 'HostedZoneStack', {
      rootDomain: rootDomain,
    });

    const radarWebCertificate = new CertificateStack(this, 'CertificateStack', {
      rootDomain: rootDomain,
      prefix: radarWebPrefix,
      hostedZone: hostedZone.hostedZone,
    });

    const webStack = new RadarWebStack(this, 'RadarWebStack', {
      certificate: radarWebCertificate.certificate,
      hostedZone: hostedZone.hostedZone,
      siteUrl: `${radarWebPrefix}.${rootDomain}`,
    });
  }
}
