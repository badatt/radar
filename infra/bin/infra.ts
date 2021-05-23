#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RadarWebStack } from '../lib/radar-web';

const app = new cdk.App();

const env = {
  account: app.node.tryGetContext('account'),
  region: app.node.tryGetContext('region'),
};

const targetEnv = app.node.tryGetContext('targetEnv');

new RadarWebStack(app, `${targetEnv}-radar-web`, {
  rootDomain: app.node.tryGetContext('rootDomain'),
  siteSubdomain: app.node.tryGetContext('siteSubdomain'),
  stackName: `${targetEnv}-radar-web`,
  env: env,
});

app.synth();
