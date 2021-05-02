---
title: 'Setup'
metaTitle: 'Setup tenant based infrastructure'
metaDescription: 'Provides documentation on creating tenenta based infrastructure'
---

First step in setting up like above multi environmental architecture is to create an [AWS Account](https://aws.amazon.com)
with your credit/debit card.

## Organizational unit

- Navigate to [AWS Organizations](https://console.aws.amazon.com/organizations/home)
- Under `Organize accounts` tab, Create a `New organizational unit` with name `codetaut`
- Under `Policies` tab, click `Enable` to enable [Service control policies (SCPs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scp.html).
- Click `Service control policies`, and then click `Create Policy`
- Give policy name **OrganizationalServicePolicies** and description **Policy that describes AWS service access across organisation**
- Under policy document editor section provide the below policy and create policy

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
The above policy explicitly denies access to listed services under `Action` array across the organization. This is
a strategic decision to avoid high cost consuming services in AWS.

- From the list of SCPs, select the above created **OrganizationalServicePolicies**, and attach Organizational units created above
  i.e `codetaut`

Account
#######

- Navigate to `AWS Organizations <https://console.aws.amazon.com/organizations/home>`\_\_
- Under _Accounts_ tab, click _Add account_
- Click **Create account** which says _Create an AWS account in this organization_
- Provide _AWS account name_ as **codetaut-tst** and provide email as **tst.codetaut@gmail.com**
- Leave the _IAM role name_ empty
- Click _Create_, and new account will added to other root organization `codetaut`
- An email should have received in your mail box, then proceed with _Access Account_
- For first time sign in, choose forgot password and reset it
- After this you will be able successfully login to the console for `codetaut-tst` account

.. note::
After login to console navigate to `IAM <https://console.aws.amazon.com/iam/home>`\_ and customize the sign-in link by
providing account alias `codetaut-tst`

- Add this account to the organizational unit `codetaut`
- Create an SCP with _Policy name_ as **TstAccountAccessPolicy** and _Description_ as **Policy for tst account access**
- Under policy document editor section provide the below policy and create policy

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
The above policy explicitly allow access to **ONLY** listed services under `Action` array.

- Select the newly created policy and attach to `codetaut-tst` account

.. note::
The above account creation process should be followed to create any other accounts in this organization, i.e `codetaut-sbx`,
`codetaut-dev`, `codetaut-prd`

All the members of the `codetautgroup` are actually IAM users. The group members can access to various
environments (accounts) using a role, that a member can switch to. Lets see a way to setup these roles
in `codetaut-tst` account.

Account
#######

We have to create a policy and attach it to a role in every account

DefaultAccountAccessPolicy

---

- Login to `codetaut-tst` account AWS console
- Navigate to `IAM Policies <https://console.aws.amazon.com/iam/home#/policies>`\_\_ and start with _Create policy_
- Switch to _JSON_ tab, and provide the below policy document in the editor

.. code-block:: json
:linenos:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowAllExceptFromOrganizatonalExceptions",
                "Action": "*",
                "Effect": "Allow",
                "Resource": "*"
            },
            {
                "Sid": "AssumeRoleDef",
                "Action": [
                    "iam:AttachRolePolicy",
                    "iam:DeleteRole",
                    "iam:DetachRolePolicy",
                    "iam:PutRolePolicy",
                    "iam:TagRole",
                    "iam:UntagRole",
                    "iam:UpdateRoleDescription",
                    "iam:UpdateAssumeRolePolicy"
                ],
                "Effect": "Deny",
                "Resource": "arn:aws:iam::ACCOUNT-ID:role/DefaultAccountAccessRole"
            },
            {
                "Sid": "AssumeRolePolicyDef",
                "Action": [
                    "iam:CreatePolicyVersion",
                    "iam:DeletePolicy"
                ],
                "Effect": "Deny",
                "Resource": "arn:aws:iam::ACCOUNT-ID:policy/DefaultAccountAccessPolicy"
            },
            {
                "Sid": "DenyingPolicy",
                "Action": [
                    "organizations:*",
                    "aws-portal:ModifyAccount",
                    "aws-portal:ModifyBilling",
                    "aws-portal:ModifyPaymentMethods",
                    "aws-portal:ViewAccount",
                    "aws-portal:ViewPaymentMethods",
                    "aws-portal:ViewUsage",
                    "access-analyzer:*",
                    "account:DisableRegion",
                    "account:EnableRegion",
                    "budgets:ModifyBudget",
                    "cur:DeleteReportDefinition",
                    "cur:ModifyReportDefinition",
                    "cur:PutReportDefinition",
                    "iam:UpdateRole",
                    "iam:CreateGroup",
                    "iam:CreateUser",
                    "iam:DeleteGroup",
                    "iam:DeleteUser",
                    "iam:GetGroup",
                    "iam:GetUser",
                    "iam:ListGroups",
                    "iam:ListUsers",
                    "iam:UpdateGroup",
                    "iam:UpdateUser",
                    "iam:DeleteAccountPasswordPolicy",
                    "iam:UpdateAccountPasswordPolicy",
                    "iam:GenerateCredentialReport",
                    "iam:GetCredentialReport",
                    "iam:DeleteAccountAlias"
                ],
                "Effect": "Deny",
                "Resource": "*"
            }
        ]
    }

- Click with _Preview Policy_
- Provide the _Name_ as **DefaultAccountAccessPolicy** and _Description_ an **Default policy that applies to an assumed role by an IAM user**
- Click _Create policy_

DefaultAccountAccessRole

---

- Navigate to `IAM Roles <https://console.aws.amazon.com/iam/home#/roles>`\_ and start with _Create role_
- Choose _Another AWS account_
- In the _Account ID_ field enter the `codetaut` account Id

.. note::
Only by providing the account Id of organization account `codetaut` will ensure that an IAM user created in that
organization shall have access to any other child account created under this organization

- Choose _Require MFA_
- Click _Next: Permissions_
- Select existing policy _DefaultAccountAccessPolicy_ and proceed.
- For _Role name_ provide **DefaultAccountAccessRole** and _Role description_ as **Default role to assume for an IAM user can get access to**
- Click _Create role_

.. note::
This role will be used to switch to by IAM users in order to get access to respective accounts.

Organization
############

Now that we have assumable role created in the child account `codetaut-tst`, we have to let IAM users / user groups
be able to assume the `DefaultAccountAccessRole`

- Login to the `codetautgroup` (`codetaut`) account and navigate to `IAM Policies <https://console.aws.amazon.com/iam/home?#/policies>`\_\_
- Create a new policy with below document

.. code-block:: json
:linenos:

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": [
                    "arn:aws:iam::ACCOUNT-ID:role/DefaultAccountAccessRole"
                ]
            }
        ]
    }

- Provide a relevant policy _Name_, in our case it should be **CodetautTstDefaultAccountAccessPolicy** and with _Description_ as **Default policy that applies to an assumed role by an IAM user to codetaut-tst account**

.. note::
Attach this policy to IAM users / user groups
