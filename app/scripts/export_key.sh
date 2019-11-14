#!/bin/bash

fingerprint=$1
destination=$2
pwd=$3
command_prefix=$4
file=$destination/$fingerprint-pk.asc

${command_prefix}gpg --export-secret-keys --armor $fingerprint > $file

echo $file
