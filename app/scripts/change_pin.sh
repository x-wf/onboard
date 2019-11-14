#!/usr/bin/expect -f

set timeout -1
set command_prefix [lindex $argv 0];
spawn $command_prefix/gpg --change-pin

# change pin
# default: 123456
expect -exact "Your selection? "
send -- "1\r"

# change admin pin
# default: 12345678
# exit
expect -exact "Your selection? "
send -- "Q\r"
expect eof