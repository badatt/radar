*****
Setup
*****

First step in setting up like above multi environmental architecture is to create an `AWS Account <https://aws.amazon.com>`_
with your credit/debit card.

Organizational unit
###################

* Navigate to `AWS Organizations <https://console.aws.amazon.com/organizations/home>`__
* Under *Organize accounts* tab, Create a *New organizational unit* with name ``codetaut``
* Under *Policies* tab, click *Enable* to enable `Service control policies (SCPs) <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scp.html>`_.
* Click *Service control policies*, and then click *Create Policy*
* Give policy name **OrganizationalServicePolicies** and description **Policy that describes AWS service access across organisation**
* Under policy document editor section provide the below policy and create policy

.. code-block:: json
    :linenos:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowAll",
                "Effect": "Allow",
                "Action": "*",
                "Resource": "*"
            },
            {
                "Sid": "ExplicitlyDeny",
                "Effect": "Deny",
                "Action": [
                    "ec2:*",
                    "elasticache:*",
                    "es:*",
                    "rds:*",
                    "mobilehub:*",
                    "devicefarm:*"
                ],
                "Resource": "*"
            }
        ]
    }

.. note::
    The above policy explicitly denies access to listed services under ``Action`` array across the organization. This is 
    a strategic decision to avoid high cost consuming services in AWS.

* From the list of SCPs, select the above created **OrganizationalServicePolicies**, and attach Organizational units created above
  i.e ``codetaut``

Account
#######

* Navigate to `AWS Organizations <https://console.aws.amazon.com/organizations/home>`__
* Under *Accounts* tab, click *Add account*
* Click **Create account** which says *Create an AWS account in this organization*
* Provide *AWS account name* as **codetaut-tst** and provide email as **tst.codetaut@gmail.com**
* Leave the *IAM role name* empty
* Click *Create*, and new account will added to other root organization ``codetaut``
* An email should have received in your mail box, then proceed with *Access Account*
* For first time sign in, choose forgot password and reset it
* After this you will be able successfully login to the console for ``codetaut-tst`` account

.. note::
    After login to console navigate to `IAM <https://console.aws.amazon.com/iam/home>`_ and customize the sign-in link by
    providing account alias ``codetaut-tst``

* Add this account to the organizational unit ``codetaut``
* Create an SCP with *Policy name* as **TstAccountAccessPolicy** and *Description* as **Policy for tst account access**
* Under policy document editor section provide the below policy and create policy

.. code-block:: json
    :linenos:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "ServicesToAllowInDev",
                "Effect": "Deny",
                "NotAction": [
                    "cloudformation:*",
                    "cloudwatch:*",
                    "logs:*",
                    "dynamodb:*",
                    "ecs:*",
                    "iam:*",
                    "kms:*",
                    "lambda:*",
                    "sts:*",
                    "events:*",
                    "cognito-identity:*",
                    "cognito-sync:*",
                    "cognito-idp:*",
                    "tag:*",
                    "s3:*",
                    "codebuild:*",
                    "codepipeline:*",
                    "secretsmanager:*",
                    "states:*",
                    "ssm:*",
                    "apigateway:*"
                ],
                "Resource": "*"
            }
        ]
    }

.. note::
    The above policy explicitly allow access to **ONLY** listed services under ``Action`` array.

* Select the newly created policy and attach to ``codetaut-tst`` account

.. note::
    The above account creation process should be followed to create any other accounts in this organization, i.e ``codetaut-sbx``,
    ``codetaut-dev``, ``codetaut-prd``
