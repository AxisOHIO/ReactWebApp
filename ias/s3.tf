resourse "aws_s3_bucket" "vite_bucket_react" {
    bucket = var.bucket_name
}

resourse "aws_s3_bucket_ownership_controls" "vite_react_bucket_ownership" {
    bucket = aws_s3_bucket.vite_react_bucket.id

    rule{
        object_ownership = "BucketOwnerPreferred"
    }  
}

resourse "aws_s3_bucket_ownership_controls" "vite_react_bucket_ownership" {
    bucket = aws_s3_bucket.vite_react_bucket.id

    block_public_acls = false
    block_public_policy = false
    ignore_public_acls
}