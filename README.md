# bluemage-dot-ca

![Deploy workflow](https://github.com/tribats/bluemage-dot-ca/workflows/Deploy%20public%20website/badge.svg)

This is my personal website that is published by Github actions to AWS on
push to the default branch. The site is served via CloudFront from an S3
origin. All the AWS resources are managed via CloudFormation.

## Deployment

When there is a push to the default branch, Github actions will do the following:

- Deploy a CloudFormation stack with the name `{repo-owner}-{repo-name}`
- Sync the contents of public/ to an S3 bucket
- Invalidate the cache of the CloudFront distribution

### Pre-Requisites

- AWS credentials with access to manage all the required resources.
  I am terrible and have a way too permissive user I use for this in an
  otherwise empty account and will hopefully get around to listing the actual
  least-privileged policy required some day.

- ACM certificate. I use a wildcard \*.bluemage.ca cert for this.

- Hosted zone setup for your domain in Route53.

### Secrets

Configure a few Actions secrets. Note that most of these aren't secrets but I
didn't really want to check-in things like account IDs and certificate ARNs
to a public Github repo.

| Secret                | Description                                                                    | Example                                                                           |
| --------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID     | access key ID for a key that has access to manage all the necessary resources. | AKIAIOSFODNN7EXAMPLE                                                              |
| AWS_SECRET_ACCESS_KEY | secret access key for the above access key ID.                                 | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY                                          |
| AWS_USER_ARN          | user ARN that is given access to the logs bucket.                              | arn:aws:iam::1234567890:user/my-user                                              |
| AWS_ACM_ARN           | ACM certificate ARN                                                            | arn:aws:acm:us-east-1:1234567890:certificate/abcd1234-12bc-34de-a00f-876519a5d8d7 |
| AWS_HOSTED_ZONE_ID    | hosted zone of the domain                                                      | Z5ACTLEATAXYV4                                                                    |
| DOMAIN                |                                                                                | bluemage.ca                                                                       |
