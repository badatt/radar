*****
Roles
*****

All the members of the ``codetautgroup`` are actually IAM users. The group members can access to various 
environments (accounts) using a role, that a member can switch to. Lets see a way to setup these roles 
in ``codetaut-tst`` account.

Account
#######

We have to create a policy and attach it to a role in every account

DefaultAccountAccessPolicy
**************************

* Login to ``codetaut-tst`` account AWS console
* Navigate to `IAM Policies <https://console.aws.amazon.com/iam/home#/policies>`__ and start with *Create policy*
* Switch to *JSON* tab, and provide the below policy document in the editor

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

* Click with *Preview Policy*
* Provide the *Name* as **DefaultAccountAccessPolicy** and *Description* an **Default policy that applies to an assumed role by an IAM user**
* Click *Create policy*

DefaultAccountAccessRole
************************

* Navigate to `IAM Roles <https://console.aws.amazon.com/iam/home#/roles>`_ and start with *Create role*
* Choose *Another AWS account*
* In the *Account ID* field enter the ``codetaut`` account Id

.. note::
    Only by providing the account Id of organization account ``codetaut`` will ensure that an IAM user created in that 
    organization shall have access to any other child account created under this organization

* Choose *Require MFA*
* Click *Next: Permissions*
* Select existing policy *DefaultAccountAccessPolicy* and proceed.
* For *Role name* provide **DefaultAccountAccessRole** and *Role description* as **Default role to assume for an IAM user can get access to**
* Click *Create role*

.. note::
    This role will be used to switch to by IAM users in order to get access to respective accounts.

Organization
############

Now that we have assumable role created in the child account ``codetaut-tst``, we have to let IAM users / user groups
be able to assume the ``DefaultAccountAccessRole``

* Login to the ``codetautgroup`` (``codetaut``) account and navigate to `IAM Policies <https://console.aws.amazon.com/iam/home?#/policies>`__
* Create a new policy with below document

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

* Provide a relevant policy *Name*, in our case it should be **CodetautTstDefaultAccountAccessPolicy** and with *Description* as **Default policy that applies to an assumed role by an IAM user to codetaut-tst account**

.. note::
    Attach this policy to IAM users / user groups