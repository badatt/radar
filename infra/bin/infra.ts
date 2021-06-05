#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { RadarAppStack } from '../lib';

const app = new App();

const env = {
  account: app.node.tryGetContext('account'),
  region: app.node.tryGetContext('region'),
};

const targetEnv = app.node.tryGetContext('targetEnv');

new RadarAppStack(app, `${targetEnv}-radar`, {
  description: 'Root stack for radar application',
  stackName: `${targetEnv}-radar`,
  env: env,
});

app.synth();
