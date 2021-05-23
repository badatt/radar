import { CfnOutput, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  PriceClass,
  SecurityPolicyProtocol,
  ViewerCertificate,
  LambdaFunctionAssociation,
} from '@aws-cdk/aws-cloudfront';
import { Certificate, CertificateValidation } from '@aws-cdk/aws-certificatemanager';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketAccessControl, ObjectOwnership } from '@aws-cdk/aws-s3';
import { ArnPrincipal, Effect, PolicyStatement, User } from '@aws-cdk/aws-iam';

/**
 * The props for SiteApp Construct
 */
export interface SiteAppProps extends StackProps {
  /**
   * Root doomain of the site
   */

  readonly rootDomain: string;

  /**
   * The path of the site contents to be uploaded to the s3 bucket
   */
  readonly siteContentPath?: string;

  /**
   * The subdomain for the site DNS created by this construct
   * e.g the instance could be use as a subdomain
   */
  readonly siteSubdomain?: string;

  /**
   * The amount of memory (in MiB) to allocate to the AWS Lambda function which
   * replicates the files from the CDK bucket to the destination bucket.
   *
   * If you are deploying large files, you will need to increase this number
   * accordingly.
   *
   * @default 128
   */
  readonly memoryLimit?: number;

  /**
   *  Lambda function associations for a cache behavior.
   */
  readonly lambdaFunctions?: LambdaFunctionAssociation[];

  /**
   * Unique identifier that specifies the AWS WAF web ACL to associate with the Site App CloudFront distribution
   */
  readonly webACLId?: string;

  /**
   * Trusted signers is how CloudFront allows you to serve private content.
   *
   * The signers are the account IDs that are allowed to sign cookies/presigned URLs for this distribution.
   *
   * They are required when the site app is running in an EMIS-X application frame as part of Application
   * Endpoint Security:
   * https://emishealthgroup.atlassian.net/wiki/spaces/SE/pages/2069037057/Application+Endpoint+Security
   */
  readonly trustedSignersAccountIds?: string[];
}

/**
 * SiteApp class that will set up generic infrastructure for a site application
 */
export class RadarWebStack extends Stack {
  /**
   * Constructor for site application
   *
   * Public attributes include:
   * -
   * @param scope
   * @param id
   * @param props
   */

  // Bucket to be available publicly
  public bucket: Bucket;

  constructor(scope: Construct, id: string, props: SiteAppProps) {
    super(scope, id, props);

    const siteUrl = props.siteSubdomain
      ? props.siteSubdomain + '.' + props.rootDomain
      : props.rootDomain;

    const hostedZone = HostedZone.fromLookup(this, 'HostedZoneLookup', {
      domainName: props.rootDomain,
    });

    const certificate = new Certificate(this, 'Certificate', {
      domainName: siteUrl,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    this.bucket = new Bucket(this, 'WebsiteBucket', {
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const githubDroidAccessPolicy = new PolicyStatement({
      actions: ['s3:DeleteObject*', 's3:PutObject', 's3:Abort*'],
      effect: Effect.ALLOW,
      principals: [new ArnPrincipal('arn:aws:iam::261778676253:user/github-droid')],
      resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
    });

    this.bucket.addToResourcePolicy(githubDroidAccessPolicy);

    new CfnOutput(this, 'WebSiteBucket', {
      value: this.bucket.bucketName,
      description: 'The S3 bucket name for the site',
    });

    // CloudFront Access Identity
    const cloudFrontAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: siteUrl + ' Access Identity',
    });

    // lambdaAssociationFunction
    const lambdaAssociation: LambdaFunctionAssociation[] = [];
    if (props && props.lambdaFunctions) {
      props.lambdaFunctions.forEach((data) => {
        lambdaAssociation.push({
          eventType: data.eventType,
          lambdaFunction: data.lambdaFunction,
        });
      });
    }

    // CloudFront distribution for site application
    const cloudfrontDistribution = new CloudFrontWebDistribution(this, 'CloudfrontDistribution', {
      comment: siteUrl + ' CloudFront distribution',
      enableIpV6: false,
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentity: cloudFrontAccessIdentity,
            s3BucketSource: this.bucket,
          },
          behaviors: [
            {
              allowedMethods: CloudFrontAllowedMethods.ALL,
              compress: true,
              forwardedValues: {
                cookies: {
                  forward: 'none',
                },
                // Forward the origin header so that the S3 origin can react to CORS requests
                // and return the expected headers.
                headers: ['Origin'],
                queryString: false,
              },
              defaultTtl: Duration.seconds(5),
              isDefaultBehavior: true,
              minTtl: Duration.seconds(5),
              lambdaFunctionAssociations: lambdaAssociation,
              trustedSigners: props.trustedSignersAccountIds,
            },
          ],
        },
      ],
      priceClass: PriceClass.PRICE_CLASS_100,
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2018,
        aliases: [siteUrl],
      }),
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0,
        },
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0,
        },
      ],
      webACLId: props.webACLId,
    });

    // Route53 arecord linking the cloudfront distribution
    new ARecord(this, 'ARecord', {
      recordName: props.siteSubdomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
      zone: hostedZone,
    });

    if (props.siteContentPath) {
      // Deploy site application contents to S3 bucket
      new BucketDeployment(this, 'deploy-site-contents', {
        distribution: cloudfrontDistribution,
        destinationBucket: this.bucket,
        distributionPaths: ['/*'],
        sources: [Source.asset(props.siteContentPath)],
        memoryLimit: props.memoryLimit,
        prune: false,
      });
    }
  }
}
