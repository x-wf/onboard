#!/bin/bash

fingerprint=$1
destination=$2
pwd=$3
file=$destination/$fingerprint-pk.asc

gpg --export-secret-keys --armor $fingerprint > $file

echo $file
